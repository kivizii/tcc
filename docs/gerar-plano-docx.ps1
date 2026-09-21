# Gera docs/Plano-Projeto-Zela.docx a partir de docs/conteudo-plano.md
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mdPath = Join-Path $root "conteudo-plano.md"
$outPath = Join-Path $root "Plano-Projeto-Zela.docx"
$staging = Join-Path $env:TEMP ("zela-docx-" + [guid]::NewGuid().ToString("N"))

function Escape-Xml([string]$s) {
    if ($null -eq $s) { return "" }
    return ($s -replace "&", "&amp;" -replace "<", "&lt;" -replace ">", "&gt;" -replace '"', "&quot;")
}

function Text-Runs([string]$text) {
    $escapedParts = New-Object System.Collections.Generic.List[string]
    $remaining = $text
    while ($remaining -match '\*\*(.+?)\*\*') {
        $before = $remaining.Substring(0, $remaining.IndexOf($Matches[0]))
        if ($before.Length -gt 0) {
            $escapedParts.Add("<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $before)</w:t></w:r>")
        }
        $bold = $Matches[1]
        $escapedParts.Add("<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $bold)</w:t></w:r>")
        $remaining = $remaining.Substring($remaining.IndexOf($Matches[0]) + $Matches[0].Length)
    }
    if ($remaining.Length -gt 0) {
        $escapedParts.Add("<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">$(Escape-Xml $remaining)</w:t></w:r>")
    }
    if ($escapedParts.Count -eq 0) {
        return "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/><w:szCs w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`"></w:t></w:r>"
    }
    return ($escapedParts -join "")
}

function Para-Xml([string]$style, [string]$text, [string]$align = "") {
    $jc = ""
    if ($align -eq "center") { $jc = "<w:jc w:val=`"center`"/>" }
    $ind = ""
    if ($style -eq "ListBullet") { $ind = "<w:ind w:left=`"720`" w:hanging=`"360`"/>" }
    $spacing = "<w:spacing w:after=`"160`" w:line=`"360`" w:lineRule=`"auto`"/>"
    if ($style -eq "Title") { $spacing = "<w:spacing w:before=`"240`" w:after=`"120`" w:line=`"276`" w:lineRule=`"auto`"/>" }
    if ($style -eq "Heading1") { $spacing = "<w:spacing w:before=`"360`" w:after=`"160`"/>" }
    if ($style -eq "Heading2") { $spacing = "<w:spacing w:before=`"280`" w:after=`"120`"/>" }
    if ($style -eq "Heading3") { $spacing = "<w:spacing w:before=`"200`" w:after=`"80`"/>" }
    $pStyle = "<w:pStyle w:val=`"$style`"/>"
    $prefix = ""
    $body = $text
    if ($style -eq "ListBullet") {
        $prefix = "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:sz w:val=`"24`"/></w:rPr><w:t xml:space=`"preserve`">• </w:t></w:r>"
        $body = $text
        $styleForText = "Normal"
    }
    $runs = Text-Runs $body
    if ($style -eq "Title") {
        $runs = "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"56`"/><w:szCs w:val=`"56`"/></w:rPr><w:t>$(Escape-Xml $text)</w:t></w:r>"
        $pStyle = "<w:pStyle w:val=`"Title`"/>"
    }
    elseif ($style -eq "Heading1") {
        $runs = "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"32`"/><w:szCs w:val=`"32`"/></w:rPr><w:t>$(Escape-Xml $text)</w:t></w:r>"
    }
    elseif ($style -eq "Heading2") {
        $runs = "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"28`"/><w:szCs w:val=`"28`"/></w:rPr><w:t>$(Escape-Xml $text)</w:t></w:r>"
    }
    elseif ($style -eq "Heading3") {
        $runs = "<w:r><w:rPr><w:rFonts w:ascii=`"Times New Roman`" w:hAnsi=`"Times New Roman`"/><w:b/><w:sz w:val=`"26`"/><w:szCs w:val=`"26`"/></w:rPr><w:t>$(Escape-Xml $text)</w:t></w:r>"
    }
    elseif ($style -eq "ListBullet") {
        $runs = $prefix + (Text-Runs $body)
        $pStyle = "<w:pStyle w:val=`"Normal`"/>"
    }
    return "<w:p><w:pPr>$pStyle$jc$ind$spacing</w:pPr>$runs</w:p>"
}

$lines = Get-Content -Path $mdPath -Encoding UTF8
$paragraphs = New-Object System.Collections.Generic.List[string]
$firstH1 = $true
$coverMode = $true

foreach ($raw in $lines) {
    $line = $raw.TrimEnd()
    if ($line -eq "---") {
        $coverMode = $false
        continue
    }
    if ([string]::IsNullOrWhiteSpace($line)) { continue }

    if ($line.StartsWith("### ")) {
        $paragraphs.Add((Para-Xml "Heading3" $line.Substring(4).Trim() $(if ($coverMode) { "center" } else { "" }))) | Out-Null
        continue
    }
    if ($line.StartsWith("## ")) {
        $paragraphs.Add((Para-Xml "Heading2" $line.Substring(3).Trim() $(if ($coverMode) { "center" } else { "" }))) | Out-Null
        continue
    }
    if ($line.StartsWith("# ")) {
        $title = $line.Substring(2).Trim()
        if ($firstH1) {
            $paragraphs.Add((Para-Xml "Title" $title "center")) | Out-Null
            $firstH1 = $false
        }
        else {
            $coverMode = $false
            $paragraphs.Add((Para-Xml "Heading1" $title)) | Out-Null
        }
        continue
    }
    if ($line.StartsWith("- ")) {
        $coverMode = $false
        $paragraphs.Add((Para-Xml "ListBullet" $line.Substring(2).Trim())) | Out-Null
        continue
    }

    $align = ""
    if ($coverMode) { $align = "center" }
    $paragraphs.Add((Para-Xml "Normal" $line.Trim() $align)) | Out-Null
}

$bodyXml = $paragraphs -join "`n"
$sectPr = @"
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838"/>
  <w:pgMar w:top="1418" w:right="1134" w:bottom="1418" w:left="1418" w:header="708" w:footer="708"/>
</w:sectPr>
"@

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
$bodyXml
$sectPr
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$docRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@

$now = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
$core = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Zela — Plano e documentação do projeto</dc:title>
  <dc:subject>TCC Análise e Desenvolvimento de Sistemas</dc:subject>
  <dc:creator>Heloise Vitoria; Lia Isiye; Geovana Pinto Ferreira</dc:creator>
  <cp:lastModifiedBy>Zela</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">$now</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">$now</dcterms:modified>
</cp:coreProperties>
"@

$app = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Zela TCC</Application>
</Properties>
"@

New-Item -ItemType Directory -Path (Join-Path $staging "_rels") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "word\_rels") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $staging "docProps") -Force | Out-Null

$utf8 = New-Object System.Text.UTF8Encoding $false
function Write-Utf8($path, $text) {
    [System.IO.File]::WriteAllText($path, $text, $utf8)
}

Write-Utf8 (Join-Path $staging "[Content_Types].xml") $contentTypes
Write-Utf8 (Join-Path $staging "_rels\.rels") $rels
Write-Utf8 (Join-Path $staging "word\document.xml") $documentXml
Write-Utf8 (Join-Path $staging "word\styles.xml") $stylesXml
Write-Utf8 (Join-Path $staging "word\_rels\document.xml.rels") $docRels
Write-Utf8 (Join-Path $staging "docProps\core.xml") $core
Write-Utf8 (Join-Path $staging "docProps\app.xml") $app

if (Test-Path $outPath) { Remove-Item $outPath -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($outPath, [System.IO.Compression.ZipArchiveMode]::Create)
function Add-Entry([System.IO.Compression.ZipArchive]$archive, [string]$filePath, [string]$entryName) {
    $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
    $inStream = [System.IO.File]::OpenRead($filePath)
    $outStream = $entry.Open()
    $inStream.CopyTo($outStream)
    $outStream.Dispose()
    $inStream.Dispose()
}

Add-Entry $zip (Join-Path $staging "[Content_Types].xml") "[Content_Types].xml"
Add-Entry $zip (Join-Path $staging "_rels\.rels") "_rels/.rels"
Add-Entry $zip (Join-Path $staging "word\document.xml") "word/document.xml"
Add-Entry $zip (Join-Path $staging "word\styles.xml") "word/styles.xml"
Add-Entry $zip (Join-Path $staging "word\_rels\document.xml.rels") "word/_rels/document.xml.rels"
Add-Entry $zip (Join-Path $staging "docProps\core.xml") "docProps/core.xml"
Add-Entry $zip (Join-Path $staging "docProps\app.xml") "docProps/app.xml"
$zip.Dispose()

Remove-Item $staging -Recurse -Force
Write-Host "Gerado: $outPath"
Write-Host ("Tamanho: " + (Get-Item $outPath).Length + " bytes")
Write-Host ("Parágrafos: " + $paragraphs.Count)
