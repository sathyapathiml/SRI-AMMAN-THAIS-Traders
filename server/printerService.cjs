const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Detects all installed Windows printers and the default printer
 */
const getInstalledPrinters = () => new Promise((resolve) => {
  if (process.platform !== 'win32') {
    return resolve({ printers: [], defaultPrinter: null });
  }

  const psCmd = `powershell -NoProfile -Command "Get-Printer | Select-Object Name, PortName, DriverName | ConvertTo-Json"`;

  exec(psCmd, (err, stdout) => {
    if (err || !stdout || !stdout.trim()) {
      return resolve({ printers: [], defaultPrinter: null });
    }
    try {
      const parsed = JSON.parse(stdout.trim());
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const printers = list.map(p => ({
        name: p.Name,
        port: p.PortName,
        driver: p.DriverName,
        isTvs: p.Name.toLowerCase().includes('tvse') || p.Name.toLowerCase().includes('rp3200')
      }));

      // Find TVS printer or first USB printer
      const defaultPrinter = printers.find(p => p.isTvs) || printers[0] || null;
      resolve({ printers, defaultPrinter });
    } catch {
      resolve({ printers: [], defaultPrinter: null });
    }
  });
});

/**
 * Sends raw bytes or receipt text directly to a Windows USB printer via Winspool.drv
 */
const printRawToWindowsPrinter = (printerName, contentBytesBase64) => new Promise((resolve, reject) => {
  if (process.platform !== 'win32') {
    return reject(new Error('Direct Windows USB printing is only supported on Windows OS.'));
  }

  const tempFile = path.join(os.tmpdir(), `tvs_receipt_${Date.now()}.bin`);
  const buffer = Buffer.from(contentBytesBase64, 'base64');
  fs.writeFileSync(tempFile, buffer);

  const psScript = `
$code = @"
using System;
using System.IO;
using System.Runtime.InteropServices;
public class RawPrinterHelper {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Ansi)]
    public class DOCINFOA {
        [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
    }
    [DllImport("winspool.Drv", EntryPoint="OpenPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);
    [DllImport("winspool.Drv", EntryPoint="ClosePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="StartDocPrinterA", SetLastError=true, CharSet=CharSet.Ansi, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);
    [DllImport("winspool.Drv", EntryPoint="EndDocPrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="StartPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="EndPagePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);
    [DllImport("winspool.Drv", EntryPoint="WritePrinter", SetLastError=true, ExactSpelling=true, CallingConvention=CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, Int32 dwCount, out Int32 dwWritten);

    public static bool SendFile(string szPrinterName, string szFileName) {
        byte[] bytes = File.ReadAllBytes(szFileName);
        IntPtr hPrinter = new IntPtr(0);
        DOCINFOA di = new DOCINFOA();
        di.pDocName = "Thermal Receipt";
        di.pDataType = "RAW";
        if (OpenPrinter(szPrinterName.Normalize(), out hPrinter, IntPtr.Zero)) {
            if (StartDocPrinter(hPrinter, 1, di)) {
                if (StartPagePrinter(hPrinter)) {
                    IntPtr pBytes = Marshal.AllocCoTaskMem(bytes.Length);
                    Marshal.Copy(bytes, 0, pBytes, bytes.Length);
                    Int32 dwWritten = 0;
                    bool success = WritePrinter(hPrinter, pBytes, bytes.Length, out dwWritten);
                    Marshal.FreeCoTaskMem(pBytes);
                    EndPagePrinter(hPrinter);
                    EndDocPrinter(hPrinter);
                    ClosePrinter(hPrinter);
                    return success;
                }
                EndDocPrinter(hPrinter);
            }
            ClosePrinter(hPrinter);
        }
        return false;
    }
}
"@
Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue
$ok = [RawPrinterHelper]::SendFile("${printerName}", "${tempFile.replace(/\\/g, '\\\\')}")
if ($ok) { Write-Output "PRINT_OK" } else { Write-Error "PRINT_ERROR" }
`;

  const psFile = path.join(os.tmpdir(), `run_print_${Date.now()}.ps1`);
  fs.writeFileSync(psFile, psScript, 'utf8');

  exec(`powershell -NoProfile -ExecutionPolicy Bypass -File "${psFile}"`, (err, stdout, stderr) => {
    try { fs.unlinkSync(tempFile); } catch {}
    try { fs.unlinkSync(psFile); } catch {}

    if (err || stderr.includes('PRINT_ERROR')) {
      reject(new Error(`Failed printing to ${printerName}: ${stderr || err.message}`));
    } else {
      resolve(true);
    }
  });
});

module.exports = {
  getInstalledPrinters,
  printRawToWindowsPrinter
};
