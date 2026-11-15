Add-Type -AssemblyName System.Drawing

function Create-Badge([int]$size, [string]$outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    # 100% Transparent background (alpha = 0)
    $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    
    $scale = [float]$size / 96.0
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    
    # Helper to create PointF
    function Pt([float]$x, [float]$y) {
        return New-Object System.Drawing.PointF(($x * $scale), ($y * $scale))
    }

    # 1. Mortarboard Diamond (Cap Top)
    $p1 = Pt 48.0 12.0
    $p2 = Pt 86.0 28.0
    $p3 = Pt 48.0 44.0
    $p4 = Pt 10.0 28.0
    [System.Drawing.PointF[]]$diamond = @($p1, $p2, $p3, $p4)
    $g.FillPolygon($brush, $diamond)

    # 2. Cap Skull Base
    $skull = New-Object System.Drawing.Drawing2D.GraphicsPath
    $s1 = Pt 26.0 35.0
    $s2 = Pt 36.0 42.0
    $s3 = Pt 60.0 42.0
    $s4 = Pt 70.0 35.0
    $skull.AddBezier($s1, $s2, $s3, $s4)
    $s5 = Pt 70.0 43.0
    $skull.AddLine($s4, $s5)
    $s6 = Pt 66.0 54.0
    $s7 = Pt 30.0 54.0
    $s8 = Pt 26.0 43.0
    $skull.AddBezier($s5, $s6, $s7, $s8)
    $skull.CloseFigure()
    $g.FillPath($brush, $skull)

    # 3. Tassel Center Button
    $btnX = (45.0 * $scale)
    $btnY = (25.0 * $scale)
    $btnW = (6.0 * $scale)
    $btnH = (6.0 * $scale)
    $g.FillEllipse($brush, $btnX, $btnY, $btnW, $btnH)

    # Tassel Ribbon
    $tasselPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $t1 = Pt 48.0 28.0
    $t2 = Pt 66.0 31.0
    $t3 = Pt 76.0 38.0
    $t4 = Pt 76.0 52.0
    $tasselPath.AddBezier($t1, $t2, $t3, $t4)
    $tasselPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 255, 255, 255), (3.0 * $scale))
    $tasselPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $tasselPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawPath($tasselPen, $tasselPath)
    
    # Tassel End Fringe
    $f1 = Pt 73.0 51.0
    $f2 = Pt 79.0 51.0
    $f3 = Pt 81.0 63.0
    $f4 = Pt 71.0 63.0
    [System.Drawing.PointF[]]$fringe = @($f1, $f2, $f3, $f4)
    $g.FillPolygon($brush, $fringe)

    # 4. Open Book - Left Page (with curved knowledge wings)
    $leftPage = New-Object System.Drawing.Drawing2D.GraphicsPath
    $lp1 = Pt 12.0 65.0
    $lp2 = Pt 22.0 59.0
    $lp3 = Pt 36.0 61.0
    $lp4 = Pt 45.0 68.0
    $leftPage.AddBezier($lp1, $lp2, $lp3, $lp4)
    $lp5 = Pt 45.0 81.0
    $leftPage.AddLine($lp4, $lp5)
    $lp6 = Pt 36.0 74.0
    $lp7 = Pt 22.0 72.0
    $lp8 = Pt 12.0 78.0
    $leftPage.AddBezier($lp5, $lp6, $lp7, $lp8)
    $leftPage.CloseFigure()
    $g.FillPath($brush, $leftPage)

    # 5. Open Book - Right Page (separated by 6px gap for spine)
    $rightPage = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rp1 = Pt 51.0 68.0
    $rp2 = Pt 60.0 61.0
    $rp3 = Pt 74.0 59.0
    $rp4 = Pt 84.0 65.0
    $rightPage.AddBezier($rp1, $rp2, $rp3, $rp4)
    $rp5 = Pt 84.0 78.0
    $rightPage.AddLine($rp4, $rp5)
    $rp6 = Pt 74.0 72.0
    $rp7 = Pt 60.0 74.0
    $rp8 = Pt 51.0 81.0
    $rightPage.AddBezier($rp5, $rp6, $rp7, $rp8)
    $rightPage.CloseFigure()
    $g.FillPath($brush, $rightPage)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outputPath successfully ($size x $size)"
}

Create-Badge 96 "public/icons/badge-96.png"
Create-Badge 72 "public/icons/badge-72.png"
Create-Badge 48 "public/icons/badge-48.png"
