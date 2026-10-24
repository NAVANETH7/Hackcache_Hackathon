$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $pptApp.Presentations.Open('e:\Hackcache\OPD_Saathi_Championship_Deck.pptx', $true, $false, $false)
$outDir = 'C:\Users\Navaneth\.gemini\antigravity-ide\brain\83b0db44-23b2-448e-9048-56ef33ca052f\exported_slides'
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}
$pres.SaveAs($outDir, 17) # 17 is ppSaveAsPNG
$pres.Close()
$pptApp.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
Write-Output "Exported slides successfully"
