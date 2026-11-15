Add-Type -AssemblyName System.Drawing
$catPath = 'public/mascot/cyber-cat.png'
$catImg = [System.Drawing.Image]::FromFile($catPath)

function Make-ProfessionalAppLogo([int]$size, [string]$dest, [bool]$isMaskable) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Transparent canvas
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    $radius = if ($isMaskable) { 0 } else { [int]($size * 0.22) }
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)

    # 1. Rounded Squircle Path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -gt 0) {
        $d = $radius * 2
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc(($size - $d), 0, $d, $d, 270, 90)
        $path.AddArc(($size - $d), ($size - $d), $d, $d, 0, 90)
        $path.AddArc(0, ($size - $d), $d, $d, 90, 90)
        $path.CloseFigure()
    } else {
        $path.AddRectangle($rect)
    }

    # 2. Fill Squircle with Luxury Deep Cyber Midnight Gradient
    $p1 = New-Object System.Drawing.PointF(0, 0)
    $p2 = New-Object System.Drawing.PointF($size, $size)
    $bgGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $p1, $p2,
        [System.Drawing.Color]::FromArgb(255, 14, 20, 48),
        [System.Drawing.Color]::FromArgb(255, 5, 8, 20)
    )
    $g.FillPath($bgGrad, $path)

    # 3. Clip inside Squircle for Clean Framing
    $g.SetClip($path)

    # Background Ambient Neon Aura behind character
    $auraBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 0, 240, 255))
    $g.FillEllipse($auraBrush, [int]($size * 0.15), [int]($size * 0.1), [int]($size * 0.7), [int]($size * 0.7))

    # 4. Gracefully draw character centered with proper scale & positioning
    $charScale = if ($isMaskable) { 0.82 } else { 0.94 }
    $charSize = [int]($size * $charScale)
    $charX = [int](($size - $charSize) / 2)
    $offsetRatio = if ($isMaskable) { 0.10 } else { 0.03 }
    $charY = [int]($size * $offsetRatio)

    $g.DrawImage($catImg, $charX, $charY, $charSize, $charSize)

    # 5. High-tech Glass Sheen Glare across top-right
    $glareBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, [int]($size * 0.6))),
        [System.Drawing.Color]::FromArgb(70, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $g.FillRectangle($glareBrush, 0, 0, $size, [int]($size * 0.5))

    # Reset clip to draw border
    $g.ResetClip()

    # 6. Sleek Metallic / Neon Bezel Ring around the Squircle
    if (-not $isMaskable) {
        $borderWidth = [float]([Math]::Max(2, $size / 96.0))
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 240, 255), $borderWidth)
        $g.DrawPath($borderPen, $path)

        # Inner subtle edge highlight
        $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 255, 255, 255), 1.0)
        $g.DrawPath($innerPen, $path)
    }

    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created professional app icon: $dest"
}

Make-ProfessionalAppLogo 512 "public/icons/icon-512.png" $false
Make-ProfessionalAppLogo 192 "public/icons/icon-192.png" $false
Make-ProfessionalAppLogo 512 "public/icons/icon-maskable-512.png" $true
Make-ProfessionalAppLogo 192 "public/icons/icon-maskable-192.png" $true
Make-ProfessionalAppLogo 180 "public/icons/apple-touch-icon.png" $false
Make-ProfessionalAppLogo 64 "public/icons/favicon-64.png" $false
Make-ProfessionalAppLogo 32 "public/icons/favicon-32.png" $false

Copy-Item "public/icons/favicon-32.png" "public/favicon.ico" -Force

$catImg.Dispose()
