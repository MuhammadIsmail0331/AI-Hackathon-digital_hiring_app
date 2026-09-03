param([string[]]$Files)
$pairs = [ordered]@{
  'border-gray-200 bg-white' = 'border-line bg-surface'
  'border-gray-100 bg-white' = 'border-line bg-surface'
  'bg-white p-5' = 'bg-surface p-5'
  'bg-white p-6' = 'bg-surface p-6'
  'bg-white/80 shadow-xl' = 'bg-surface/90 shadow-xl'
  'bg-gray-50/50' = 'bg-surface2/50'
  'bg-gray-50' = 'bg-surface2'
  'bg-gray-100' = 'bg-surface2'
  'bg-gray-200' = 'bg-line'
  'border-gray-200' = 'border-line'
  'border-gray-300' = 'border-line'
  'border-gray-100' = 'border-line'
  'text-gray-900' = 'text-ink'
  'text-gray-800' = 'text-ink'
  'text-gray-700' = 'text-ink'
  'text-gray-600' = 'text-muted'
  'text-gray-500' = 'text-muted'
  'text-gray-400' = 'text-muted'
  'text-gray-300' = 'text-line'
  'hover:bg-gray-100' = 'hover:bg-surface2'
  'hover:bg-gray-50' = 'hover:bg-surface2'
  'bg-red-500' = 'bg-danger'
  'text-red-700' = 'text-danger'
  'border-red-300' = 'border-danger/40'
  'focus:ring-blue-200' = 'focus:ring-primarysoft'
  'focus:border-blue-400' = 'focus:border-primary'
  'bg-green-500' = 'bg-success'
  'hover:text-yellow-500' = 'hover:text-accent'
  'text-yellow-400' = 'text-accent'
}
foreach ($f in $Files) {
  if (-not (Test-Path -LiteralPath $f)) { Write-Host "SKIP: $f"; continue }
  $c = Get-Content -LiteralPath $f -Raw -Encoding UTF8
  foreach ($k in $pairs.Keys) { $c = $c.Replace($k, $pairs[$k]) }
  [IO.File]::WriteAllText((Join-Path (Get-Location) $f), $c, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "dark-swept: $f"
}
