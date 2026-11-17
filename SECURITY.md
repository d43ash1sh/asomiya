# Security

## Reporting a problem

Please report security problems privately to the maintainers through
[GitHub's private vulnerability reporting](https://github.com/d43ash1sh/asomiya/security/advisories/new)
rather than in a public issue.

## What Asomiya protects against

Asomiya programs can't touch files, the network or the host process. The only side effects are
printing (`কোৱা`) and reading a line of input (`সোধা`). Running an untrusted `.asom` file or a
shared playground link is meant to be safe, within these limits:

| Risk                               | Protection                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Infinite loops                     | Step budget (R008), `--max-steps`                                          |
| Deep recursion                     | Call-depth limit (R009)                                                    |
| Deeply nested code                 | Parser nesting limit (P010)                                                |
| Huge text or lists                 | Size limits (R019); text work is linear in length                          |
| Hidden code (Trojan Source)        | Bidi and other invisible controls are rejected in text and comments (L008) |
| Terminal escape sequences          | Same as above; diagnostics show control characters as visible symbols      |
| Look-alike names                   | ZWJ/ZWNJ only allowed in names after Assamese characters                   |
| Script injection in the playground | Output is inserted as text, never HTML; a Content Security Policy is set   |

Programs can still print anything they like that is written with visible characters, and a long
but bounded program can keep the CPU busy until the step budget runs out (about a second).
