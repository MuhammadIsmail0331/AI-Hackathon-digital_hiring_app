param([string[]]$Files)

$pairs = [ordered]@{
  'border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' = 'border-2 border-dashed border-primary/40 bg-primarysoft'
  'border-dashed border-blue-300 bg-blue-50' = 'border-dashed border-primary/40 bg-primarysoft'
  'border-dashed border-gray-200 bg-gray-50' = 'border-dashed border-line bg-surface2'
  'border-dashed border-gray-300 bg-gray-50' = 'border-dashed border-line bg-surface2'
  'from-blue-600 to-blue-700' = 'from-primary to-primarystrong'
  'hover:bg-green-700' = 'hover:bg-success/90'
  'bg-green-600' = 'bg-success'
  'border-gray-200 bg-white' = 'border-line bg-surface'
  'border-gray-100 bg-white' = 'border-line bg-surface'
  'bg-blue-500' = 'bg-primary'
  'bg-blue-600' = 'bg-primary'
  'hover:bg-blue-100' = 'hover:bg-primarysoft'
  'hover:bg-blue-50' = 'hover:bg-primarysoft'
  'bg-blue-50' = 'bg-primarysoft'
  'bg-green-100' = 'bg-successsoft'
  'bg-green-50' = 'bg-successsoft'
  'border-green-200' = 'border-success/30'
  'bg-amber-50' = 'bg-accentsoft'
  'border-amber-200' = 'border-accent/30'
  'border-blue-200' = 'border-primary/30'
  'border-blue-300' = 'border-primary/40'
  'bg-green-500' = 'bg-success'
  'text-blue-600' = 'text-primary'
  'text-blue-700' = 'text-primary'
  'hover:text-blue-700' = 'hover:text-primarystrong'
  'hover:border-blue-300' = 'hover:border-primary/40'
  'hover:border-blue-200' = 'hover:border-primary/30'
  'text-green-800' = 'text-success'
  'text-green-700' = 'text-success'
  'text-green-600' = 'text-success'
  'text-amber-700' = 'text-accent'
  'text-amber-800' = 'text-accent'
  'hover:text-gray-800' = 'hover:text-ink'
  'hover:text-gray-700' = 'hover:text-ink'
  'hover:text-gray-500' = 'hover:text-muted'
  'hover:bg-gray-100' = 'hover:bg-surface2'
  'hover:bg-gray-50' = 'hover:bg-surface2'
  'text-gray-900' = 'text-ink'
  'text-gray-700' = 'text-ink'
  'text-gray-600' = 'text-muted'
  'text-gray-500' = 'text-muted'
  'text-gray-400' = 'text-muted'
  'bg-gray-100' = 'bg-surface2'
  'bg-gray-200' = 'bg-line'
  'border-gray-300' = 'border-line'
  'border-gray-200' = 'border-line'
  'border-gray-100' = 'border-line'
}

foreach ($f in $Files) {
  if (-not (Test-Path -LiteralPath $f)) { Write-Host "SKIP (missing): $f"; continue }
  $c = Get-Content -LiteralPath $f -Raw -Encoding UTF8
  foreach ($k in $pairs.Keys) { $c = $c.Replace($k, $pairs[$k]) }
  Set-Content -LiteralPath $f -Value $c -Encoding UTF8 -NoNewline
  Write-Host "swept: $f"
}
