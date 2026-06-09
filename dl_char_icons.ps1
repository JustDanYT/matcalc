$outputDir = "C:\Users\Dan\Downloads\matcalc-main\matcalc-main\public\assets\icons\characters"
$errors = @()
$succeeded = @()

$characters = @(
    @{ id = 'aemeath'; wiki = 'Aemeath' },
    @{ id = 'chisa'; wiki = 'Chisa' },
    @{ id = 'buling'; wiki = 'Buling' },
    @{ id = 'lynae'; wiki = 'Lynae' },
    @{ id = 'luuk_herssen'; wiki = 'Luuk Herssen' },
    @{ id = 'mornye'; wiki = 'Mornye' },
    @{ id = 'sigrika'; wiki = 'Sigrika' },
    @{ id = 'hiyuki'; wiki = 'Hiyuki' },
    @{ id = 'denia'; wiki = 'Denia' },
    @{ id = 'lucy'; wiki = 'Lucy' },
    @{ id = 'rebecca'; wiki = 'Rebecca' },
    @{ id = 'lucilla'; wiki = 'Lucilla' }
)

Write-Host "Fetching character card images from wiki..." -ForegroundColor Cyan

foreach ($char in $characters) {
    $outPath = Join-Path $outputDir "$($char.id).webp"
    
    if (Test-Path $outPath) {
        Write-Host "  [SKIP] $($char.id) - already exists" -ForegroundColor Yellow
        $succeeded += $char.id
        continue
    }

    $wikiName = $char.wiki
    $encodedWiki = [System.Uri]::EscapeDataString($wikiName)

    # Step 1: Get list of images on the character's wiki page
    try {
        $apiUrl = "https://wutheringwaves.fandom.com/api.php?action=query&titles=$encodedWiki&prop=images&format=json"
        $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 15
        $data = $response.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "  [FAIL] $($char.id) - API error: $_" -ForegroundColor Red
        $errors += "$($char.id): API error - $_"
        continue
    }

    # Find the Card image (e.g., "File:Aemeath Card.jpg" or "File:Chisa Card.jpg")
    $cardImage = $null
    foreach ($pageId in $data.query.pages.PSObject.Properties) {
        if ($pageId.Value.images) {
            foreach ($img in $pageId.Value.images) {
                $title = $img.title
                if ($title -match "Card\.(png|jpg|jpeg)$") {
                    $cardImage = $title
                    break
                }
            }
        }
        if ($cardImage) { break }
    }

    if (-not $cardImage) {
        Write-Host "  [FAIL] $($char.id) - no Card image found" -ForegroundColor Red
        $errors += "$($char.id): No Card image found"
        continue
    }

    # Step 2: Get the direct URL for the Card image
    try {
        $encodedCard = [System.Uri]::EscapeDataString($cardImage)
        $imgUrlApi = "https://wutheringwaves.fandom.com/api.php?action=query&titles=$encodedCard&prop=imageinfo&iiprop=url&format=json"
        $imgResponse = Invoke-WebRequest -Uri $imgUrlApi -UseBasicParsing -TimeoutSec 15
        $imgData = $imgResponse.Content | ConvertFrom-Json
    }
    catch {
        Write-Host "  [FAIL] $($char.id) - imageinfo error: $_" -ForegroundColor Red
        $errors += "$($char.id): imageinfo error - $_"
        continue
    }

    $imgUrl = $null
    foreach ($pid in $imgData.query.pages.PSObject.Properties) {
        if ($pid.Value.imageinfo -and $pid.Value.imageinfo.Count -gt 0) {
            $imgUrl = $pid.Value.imageinfo[0].url
            break
        }
    }

    if (-not $imgUrl) {
        Write-Host "  [FAIL] $($char.id) - could not extract image URL" -ForegroundColor Red
        $errors += "$($char.id): Could not extract image URL"
        continue
    }

    # Step 3: Download the image
    try {
        Invoke-WebRequest -Uri $imgUrl -OutFile $outPath -UseBasicParsing -TimeoutSec 30
        $size = (Get-Item $outPath).Length
        Write-Host "  [OK] $($char.id) - $size bytes" -ForegroundColor Green
        $succeeded += $char.id
    }
    catch {
        Write-Host "  [FAIL] $($char.id) - download error: $_" -ForegroundColor Red
        $errors += "$($char.id): download error - $_"
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Succeeded: $($succeeded.Count)" -ForegroundColor Green
if ($errors.Count -gt 0) {
    Write-Host "Errors: $($errors.Count)" -ForegroundColor Red
    foreach ($e in $errors) { Write-Host "  - $e" -ForegroundColor Red }
}
