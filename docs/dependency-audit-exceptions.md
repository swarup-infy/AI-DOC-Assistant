# Dependency Audit Exceptions

Last reviewed: 2026-10-23

The Python audit intentionally ignores only the advisories listed below. This is a temporary, explicit exception list so CI can still fail on other newly reported Python dependency vulnerabilities. **An ignored advisory is not a fixed vulnerability.** Revisit this file whenever the dependency tree or upstream advisories change.

## Pillow 12.3.0 (pulled in by FastEmbed 0.9.0)

The current FastEmbed release constrains Pillow to versions below 13, while the advisories below list Pillow 13.0.0 as the patched version. Pinning Pillow 13 directly makes the current dependency resolver fail. The application currently processes PDF, DOCX, CSV, and spreadsheet documents and does not intentionally expose image-processing endpoints; Pillow is transitive rather than a declared application feature. This reduces the relevant attack surface but does not prove the package is safe.

Ignored Pillow advisories:
- `GHSA-p4wg-p73j-c528`
- `GHSA-65qm-jvmh-6pqg`
- `GHSA-58r4-6rv3-gfh8`
- `GHSA-pchr-8j38-3x4p`
- `GHSA-q45j-58j2-45rg`
- `GHSA-462x-pgg6-55fp`
- `GHSA-c6hw-5grf-ff96`
- `GHSA-vx6w-vv9f-6gvg`
- `GHSA-7mwm-ghpf-9vrm`
- `GHSA-w889-685w-c8fh`
- `GHSA-j4m9-6w36-pw47`
- `GHSA-27h8-gf7j-v5hc`
- `GHSA-fc9g-5qg7-mf45`
- `GHSA-cp9v-662q-vvx9`
- `GHSA-22hg-r758-rrw9`
- `GHSA-74r2-7ff9-mjj2`
- `GHSA-xgh8-jp6q-p5x8`
- `GHSA-254f-3936-288h`
- `GHSA-jg86-v3jv-hrpm`
- `GHSA-f2g6-542v-9j58`
- `GHSA-5xm2-6676-qcp9`
- `GHSA-gg2r-wvfm-q9rx`
- `GHSA-332p-7hrc-92wf`
- `GHSA-4rr5-89j8-mwwm`
- `GHSA-24rc-8hj2-v98c`
- `GHSA-4rm8-3hmm-39fg`
- `GHSA-mrfp-p49p-3hf2`
- `GHSA-3j72-p6qg-6xp7`
- `GHSA-v9pv-5gc8-w2m6`
- `GHSA-g4qv-2jxx-769h`
- `GHSA-g842-9rc4-69pw`
- `GHSA-9v9v-9qvf-h2hj`
- `GHSA-g7cr-3p24-7wf7`
- `GHSA-p8hx-v2p6-rp84`
- `GHSA-78g4-xqwv-q3g8`

**Required follow-up:** remove these exceptions as soon as a compatible FastEmbed release allows installing a patched Pillow release, or replace FastEmbed with a supported embedding stack that does not constrain Pillow to vulnerable versions.

## ChromaDB 1.5.9

The current public advisory feed reports these four ChromaDB advisories without a published fixed version. This project uses `chromadb.PersistentClient` (embedded local storage), not a separately exposed ChromaDB HTTP server. Keep it embedded, never expose a ChromaDB server port, and do not enable untrusted remote model code. These deployment controls reduce exposure but do not establish that every advisory is inapplicable.

Ignored ChromaDB advisories:
- `PYSEC-2026-311`
- `PYSEC-2026-3814`
- `PYSEC-2026-3815`
- `PYSEC-2026-3813`

**Required follow-up:** remove these exceptions and upgrade as soon as ChromaDB publishes a patched version; re-run `pip-audit`, the backend tests, and deployment-specific security tests.

## Policy

- PyJWT is pinned to 2.15.1 to address the findings reported for 2.10.1.
- No JavaScript audit findings are allowlisted.
- Do not describe the Python audit as vulnerability-free while any exceptions remain.
