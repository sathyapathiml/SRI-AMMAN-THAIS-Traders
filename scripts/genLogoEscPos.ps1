Add-Type -AssemblyName System.Drawing

$imgPath = "d:\Billing system\public\logo.jpg"
$orig = [System.Drawing.Image]::FromFile($imgPath)

$targetW = 320
$targetH = 320

$bmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($orig, 0, 0, $targetW, $targetH)
$g.Dispose()
$orig.Dispose()

# Create 1D array of grayscale values (0.0 to 255.0)
$gray = New-Object 'double[]' ($targetW * $targetH)
for ($y = 0; $y -lt $targetH; $y++) {
    for ($x = 0; $x -lt $targetW; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $gray[$y * $targetW + $x] = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
    }
}
$bmp.Dispose()

# Floyd-Steinberg Error Diffusion Dithering
for ($y = 0; $y -lt $targetH; $y++) {
    for ($x = 0; $x -lt $targetW; $x++) {
        $idx = $y * $targetW + $x
        $oldVal = $gray[$idx]
        if ($oldVal -lt 128.0) {
            $newVal = 0.0 # Black
        } else {
            $newVal = 255.0 # White
        }
        $gray[$idx] = $newVal
        $err = $oldVal - $newVal

        if ($x + 1 -lt $targetW) {
            $gray[$y * $targetW + ($x + 1)] += $err * 7.0 / 16.0
        }
        if (($x - 1 -ge 0) -and ($y + 1 -lt $targetH)) {
            $gray[($y + 1) * $targetW + ($x - 1)] += $err * 3.0 / 16.0
        }
        if ($y + 1 -lt $targetH) {
            $gray[($y + 1) * $targetW + $x] += $err * 5.0 / 16.0
        }
        if (($x + 1 -lt $targetW) -and ($y + 1 -lt $targetH)) {
            $gray[($y + 1) * $targetW + ($x + 1)] += $err * 1.0 / 16.0
        }
    }
}

# Pack bits into ESC/POS bytes: 1 bit per pixel, MSB first, 1 = Black, 0 = White
$bytesPerRow = [int]($targetW / 8)
$dataBytes = New-Object byte[] ($bytesPerRow * $targetH)
$dataIdx = 0
for ($y = 0; $y -lt $targetH; $y++) {
    for ($xByte = 0; $xByte -lt $bytesPerRow; $xByte++) {
        $byteVal = 0
        for ($b = 0; $b -lt 8; $b++) {
            $px = $xByte * 8 + $b
            if ($gray[$y * $targetW + $px] -lt 128.0) {
                $byteVal = $byteVal -bor (1 -shl (7 - $b))
            }
        }
        $dataBytes[$dataIdx] = [byte]$byteVal
        $dataIdx++
    }
}

# Build ESC/POS command:
# GS v 0 0 xL xH yL yH [data]
$xL = [byte]($bytesPerRow -band 0xFF)
$xH = [byte](($bytesPerRow -shr 8) -band 0xFF)
$yL = [byte]($targetH -band 0xFF)
$yH = [byte](($targetH -shr 8) -band 0xFF)

$cmdList = New-Object System.Collections.Generic.List[byte]
# Align Center: ESC a 1 (0x1B, 0x61, 0x01)
$cmdList.Add(0x1B)
$cmdList.Add(0x61)
$cmdList.Add(0x01)
# GS v 0 0
$cmdList.Add(0x1D)
$cmdList.Add(0x76)
$cmdList.Add(0x30)
$cmdList.Add(0x00)
$cmdList.Add($xL)
$cmdList.Add($xH)
$cmdList.Add($yL)
$cmdList.Add($yH)
foreach ($b in $dataBytes) {
    $cmdList.Add($b)
}
# Line feed: LF (0x0A)
$cmdList.Add(0x0A)

# Export base64 of ESC/POS bytes to src/data/logoEscPos.ts
$finalBytes = $cmdList.ToArray()
$b64 = [Convert]::ToBase64String($finalBytes)
$tsCode = "export const LOGO_ESCPOS_BASE64 = '$b64';" + [Environment]::NewLine +
    "export const getLogoEscPosBytes = (): number[] => {" + [Environment]::NewLine +
    "  const bin = atob(LOGO_ESCPOS_BASE64);" + [Environment]::NewLine +
    "  const bytes = new Array(bin.length);" + [Environment]::NewLine +
    "  for (let i = 0; i < bin.length; i++) {" + [Environment]::NewLine +
    "    bytes[i] = bin.charCodeAt(i);" + [Environment]::NewLine +
    "  }" + [Environment]::NewLine +
    "  return bytes;" + [Environment]::NewLine +
    "};" + [Environment]::NewLine

[System.IO.File]::WriteAllText("d:\Billing system\src\data\logoEscPos.ts", $tsCode)
Write-Output ("Generated logoEscPos.ts! Total ESC/POS bytes: " + $finalBytes.Length)
