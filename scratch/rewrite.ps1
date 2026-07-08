$env:GIT_SEQUENCE_EDITOR = "powershell -Command `"(`$content = Get-Content `$args[0]) -replace '(?m)^pick (7b8e269|587a51f|ea3c7d8)', 'reword `$1' | Set-Content `$args[0]`""
$env:GIT_EDITOR = "powershell -Command `"(`$content = Get-Content `$args[0]) -replace 'niahere→clara rename, ', 'internal naming cleanup, ' -replace 'rewrite of niahere as', 'rewrite of the codebase as' -replace 'NiaTool', 'ClaraTool' -replace 'nia/niahere references', 'legacy references' -replace '(?i)\bnia(here)?\b', 'clara' | Set-Content `$args[0]`""
git rebase -i --root
