$cards = @(
    @{ id = "aemeath"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/e/e8/Resonator_Aemeath.png/revision/latest?cb=20260203014703" },
    @{ id = "chisa"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/d/d7/Resonator_Chisa.png/revision/latest?cb=20251018043830" },
    @{ id = "buling"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/7/70/Resonator_Buling.png/revision/latest?cb=20251018043729" },
    @{ id = "denia"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/c/cc/Resonator_Denia.png/revision/latest?cb=20260519215928" },
    @{ id = "lynae"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/3/34/Resonator_Lynae.png/revision/latest?cb=20260101050739" },
    @{ id = "luuk_herssen"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/e/eb/Resonator_Luuk_Herssen.png/revision/latest?cb=20260330181213" },
    @{ id = "mornye"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/2/25/Resonator_Mornye.png/revision/latest?cb=20260101050827" },
    @{ id = "sigrika"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/6/67/Resonator_Sigrika.png/revision/latest?cb=20260319201628" },
    @{ id = "hiyuki"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/8/8e/Resonator_Hiyuki.png/revision/latest?cb=20260501160450" },
    @{ id = "lucy"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/5/57/Resonator_Lucy.png/revision/latest?cb=20260608172024" },
    @{ id = "rebecca"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/b/bd/Resonator_Rebecca.png/revision/latest?cb=20260608172211" },
    @{ id = "lucilla"; url = "https://static.wikia.nocookie.net/wutheringwaves/images/a/a0/Resonator_Lucilla.png/revision/latest?cb=20260608172652" }
)

$outDir = "public/assets/icons/characters"
foreach ($c in $cards) {
    $outPath = Join-Path $outDir "$($c.id).webp"
    Write-Host "Downloading $($c.id)..."
    Invoke-WebRequest -Uri $c.url -OutFile $outPath
}
Write-Host "Done!"
