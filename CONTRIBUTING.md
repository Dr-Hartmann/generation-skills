# Development and Quality Checks

## Local setup

The application generator requires Python 3.10 or later and has no third-party runtime dependencies.

Install pre-commit and register its Git hook:

```bash
python -m pip install --upgrade pre-commit
pre-commit install
```

Run all checks manually:

```bash
pre-commit run --all-files
python -m unittest discover -s app-generator/tests -v
python app-generator/scripts/generate_app.py \
  --config app-generator/examples/scene.json \
  --scene app-generator/examples/scene.js \
  --output /tmp/generator-example.html
python app-generator/scripts/validate_app.py /tmp/generator-example.html
```

Pre-commit runs repository hygiene checks and Ruff. Ruff checks Python 3.10-compatible syntax and common correctness errors; its formatting hook keeps Python formatting consistent. The archived files in `Done (don't touch)/` are intentionally excluded from pre-commit because they are immutable reference artifacts.

## SonarQube setup

The repository includes `sonar-project.properties` and a GitHub Actions workflow. The workflow supports both SonarQube Cloud and a self-hosted SonarQube Server.

1. Create/import the repository as a project in SonarQube. The configured project key is `Dr-Hartmann_generation-skills`; update `sonar.projectKey` if your SonarQube project uses another key.
2. Add a repository Actions secret named `SONAR_TOKEN`.
3. For SonarQube Cloud, add a repository Actions variable named `SONAR_ORGANIZATION` containing the organization key.
4. For SonarQube Server, add a repository Actions variable named `SONAR_HOST_URL` containing the server base URL, for example `https://sonarqube.example.com`.

When `SONAR_HOST_URL` is set, the workflow uses SonarQube Server. Otherwise, it uses SonarQube Cloud when `SONAR_ORGANIZATION` is set. If the token or target configuration is missing, the workflow reports that the scan was skipped. The scanner waits for the Quality Gate result and fails the job when the gate fails.

After the first successful run, add the `SonarQube analysis` status check to the repository's branch-protection or ruleset requirements if merges must be blocked on a failed Quality Gate.
