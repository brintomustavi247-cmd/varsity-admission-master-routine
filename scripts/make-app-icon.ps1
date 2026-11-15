Add-Type -AssemblyName System.Drawing

$catPath = "public/mascot/cyber-cat.png"
if (-not (Test-Path $catPath)) {
    Write-Error "Cat file not found: $catPath"
    exit 1
}

$catImg = [System.Drawing.Image]::FromFile($catPath)

function Generate-AuraEmblemLogo([int]$size, [string]$dest, [bool]$isMaskable) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))

    $padding = if ($isMaskable) { 0 } else { [int]($size * 0.04) }
    $innerSize = $size - ($padding * 2)
    $radius = if ($isMaskable) { 0 } else { [int]($innerSize * 0.24) }

    # Outer Squircle Path
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    if ($radius -gt 0) {
        $d = $radius * 2
        $path.AddArc($padding, $padding, $d, $d, 180, 90)
        $path.AddArc(($padding + $innerSize - $d), $padding, $d, $d, 270, 90)
        $path.AddArc(($padding + $innerSize - $d), ($padding + $innerSize - $d), $d, $d, 0, 90)
        $path.AddArc($padding, ($padding + $innerSize - $d), $d, $d, 90, 90)
        $path.CloseFigure()
    } else {
        $path.AddRectangle((New-Object System.Drawing.Rectangle(0, 0, $size, $size)))
    }

    # 1. Fill Base Background with Dark Cyber Space Gradient
    $bgGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, $size)),
        [System.Drawing.Color]::FromArgb(255, 10, 16, 36),
        [System.Drawing.Color]::FromArgb(255, 3, 5, 14)
    )
    $g.FillPath($bgGrad, $path)

    # 2. Clip inside the Emblem Base
    $g.SetClip($path)

    # 3. Draw Background Radiant Cyber Energy Halo
    $haloBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $haloBrush.CenterColor = [System.Drawing.Color]::FromArgb(120, 0, 240, 255)
    $haloBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 5, 8, 20))
    $g.FillPath($haloBrush, $path)

    # Secondary Crimson Energy Rim at bottom
    $crimsonBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 255, 23, 68))
    $g.FillEllipse($crimsonBrush, [int]($size * 0.1), [int]($size * 0.65), [int]($size * 0.8), [int]($size * 0.5))

    # Circular Inner Tech Crest Portal
    $portalBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 6, 10, 24))
    $portalSize = [int]($innerSize * 0.88)
    $portalX = [int](($size - $portalSize) / 2)
    $portalY = [int]($size * 0.08)
    $g.FillEllipse($portalBrush, $portalX, $portalY, $portalSize, $portalSize)

    # Tech Ring around the Portal
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(90, 0, 240, 255), [float]([Math]::Max(1.5, $size / 140.0)))
    $g.DrawEllipse($ringPen, $portalX, $portalY, $portalSize, $portalSize)

    # 4. Gracefully Center & Scale the Cyber-Cat Mascot
    # We focus on the upper cat head, ears, and glowing visor to make an iconic emblem
    $charScale = if ($isMaskable) { 0.78 } else { 0.90 }
    $catW = [int]($size * $charScale)
    $catH = [int]($size * $charScale)
    $catX = [int](($size - $catW) / 2)
    $catY = [int]($size * 0.06)

    # Draw the character
    $g.DrawImage($catImg, $catX, $catY, $catW, $catH)

    # 5. Bottom Tech Banner Plaque
    $bannerH = [int]($size * 0.16)
    $bannerY = [int]($size - $bannerH - $padding)
    $bannerGrad = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, $bannerY)),
        (New-Object System.Drawing.PointF(0, $size)),
        [System.Drawing.Color]::FromArgb(235, 6, 12, 28),
        [System.Drawing.Color]::FromArgb(250, 3, 6, 16)
    )
    $g.FillRectangle($bannerGrad, 0, $bannerY, $size, $bannerH)

    # Glowing Cyan Horizon Line above banner
    $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(220, 0, 240, 255), [float]([Math]::Max(1.5, $size / 120.0)))
    $g.DrawLine($linePen, 0, $bannerY, $size, $bannerY)

    # Crimson Energy Core Dot in the center of the horizon line
    $dotSize = [int]([Math]::Max(4, $size * 0.024))
    $dotX = [int](($size - $dotSize) / 2)
    $dotY = [int]($bannerY - ($dotSize / 2))
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 23, 68))
    $g.FillEllipse($dotBrush, $dotX, $dotY, $dotSize, $dotSize)

    # Holographic Glass Sheen Glare across top
    $glareBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, 0)),
        (New-Object System.Drawing.PointF($size, [int]($size * 0.55))),
        [System.Drawing.Color]::FromArgb(75, 255, 255, 255),
        [System.Drawing.Color]::FromArgb(0, 255, 255, 255)
    )
    $g.FillRectangle($glareBrush, 0, 0, $size, [int]($size * 0.5))

    # Reset Clip to draw outer crisp bezel
    $g.ResetClip()

    if (-not $isMaskable) {
        # Outer Glowing Bezel
        $outerWidth = [float]([Math]::Max(2.5, $size / 80.0))
        $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 0, 240, 255), $outerWidth)
        $g.DrawPath($outerPen, $path)

        # Subtle Inner Metallic Highlight
        $innerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 255, 255), 1.0)
        $g.DrawPath($innerPen, $path)
    }

    # Save PNG
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated Emblem Logo: $dest ( x )"
}

Generate-AuraEmblemLogo 512 "public/icons/icon-512.png" $false
Generate-AuraEmblemLogo 192 "public/icons/icon-192.png" $false
Generate-AuraEmblemLogo 512 "public/icons/icon-maskable-512.png" $true
Generate-AuraEmblemLogo 192 "public/icons/icon-maskable-192.png" $true
Generate-AuraEmblemLogo 180 "public/icons/apple-touch-icon.png" $false
Generate-AuraEmblemLogo 192 "public/icons/mascot-notification.png" $false
Generate-AuraEmblemLogo 64 "public/icons/favicon-64.png" $false
Generate-AuraEmblemLogo 32 "public/icons/favicon-32.png" $false

Copy-Item "public/icons/favicon-32.png" "public/favicon.ico" -Force

$catImg.Dispose()
Write-Host "All App Icons Generated Successfully!"
