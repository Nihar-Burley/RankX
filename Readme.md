# RankX - Application Development & Artifact Lifecycle

## 1. Project Overview

**RankX** serves as the central Nervous System for the **RankHex** application ecosystem. This project defines the standards for how our microservices (Java/Spring Boot) are built, versioned, and containerized.

By utilizing a centralized Artifact Repository Manager (ARM), we ensure that every developer and every production server uses the exact same verified binaries, reducing "it works on my machine" errors.

----------

## 2. Core Concepts & Repository Types

Understanding how Nexus organizes data is critical for proper development workflow.

### A. Repository Types

| Type | Name | How it Works | Purpose |
|------|------|------|------|
| **Proxy** | `maven-central` | It acts as an "intermediary." When you request a library (like Spring Boot), Nexus downloads it from the internet once and caches it locally. | Saves bandwidth and ensures build stability if the external site goes down.|
| **Hosted** | `maven-releases` | A private storage area owned by RankHex. Only internal developers can push code here. | Stores our proprietary microservices and internal tools. |
| **Group**| `maven-public` | A "Virtual" repository. It combines multiple Proxy and Hosted repos into one single URL. | Developers only need to put ONE URL in their `settings.xml` to see everything. |


### B. Versioning Logic: Release vs. Snapshot

-   **Snapshot (`-SNAPSHOT`):** Used during active development (e.g., `1.0.0-SNAPSHOT`). These are **mutable**, meaning they can be overwritten every time you run `mvn deploy`. Maven will automatically check for the "latest" timestamp.

-   **Release:** Used for production-ready code (e.g., `1.0.0`). These are **immutable**. Once a version is pushed to the Release repo, it can **never** be changed or deleted. This ensures production deployments are predictable.


----------

## 3. Global Environment Setup

Every developer must perform this one-time setup on their local workstation (Mac M4, PC, or Linux).

### Maven Authentication (`~/.m2/settings.xml`)

This file allows your local Maven process to talk to `https://trainwithats.online/nexus`.

XML

```xml
<settings>
  <servers>
    <server>
      <id>rankx-nexus</id>
      <username>admin</username>
      <password>admin</password>
    </server>
  </servers>

  <mirrors>
    <mirror>
      <id>rankx-mirror</id>
      <name>RankX Central Mirror</name>
      <url>https://trainwithats.online/nexus/repository/maven-public/</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>
</settings>

```

----------

## 4. Application Configuration (`pom.xml`)

To enable the "Deploy" phase, include the `distributionManagement` section.

XML

```xml
<project>
    <groupId>com.application</groupId>
    <artifactId>your-service-name</artifactId>
    <version>1.0.1</version> 

    <distributionManagement>
        <repository>
            <id>rankx-nexus</id>
            <url>https://trainwithats.online/nexus/repository/maven-trainwithats-release/</url>
        </repository>
        <snapshotRepository>
            <id>rankx-nexus</id>
            <url>https://trainwithats.online/nexus/repository/maven-trainwithats-snapshort/</url>
        </snapshotRepository>
    </distributionManagement>
</project>

```

----------

## 5. Build & Publish Workflow

### Step 1: Local Package

Bash

```
mvn clean package -DskipTests

```

### Step 2: Deploy to RankX (JAR)

Bash

```
mvn clean deploy -DskipTests

```

### Step 3: Dockerize & Push

Nexus uses port **8083** for internal image uploads (Hosted) and **8082** for pulling (Group).

Bash

```
# 1. Login
docker login trainwithats.online:8083 -u admin

# 2. Build for Linux Architecture (Important for Mac M4 users)
docker build --platform linux/amd64 -t trainwithats.online:8083/your-service:1.0.1 .

# 3. Push
docker push trainwithats.online:8083/your-service:1.0.1

```

----------

## 6. Repository Architecture Reference

------

| Type	| Repository Name	| How it Works	| Purpose |
|:-----:|-----------------|---------------|---------|
| **Proxy**	| maven-proxy / npm-proxy	| Acts as an intermediary; downloads and caches public libraries locally.	| Reduces external bandwidth and ensures build stability if public registries are down. |
| **Hosted** | maven-trainwithats-release	| A private, Immutable store for final versions of internal code.	| Stores production-ready internal microservices (e.g., v1.0.0). |
| **Hosted**	| maven-trainwithats-snapshort | A private, Mutable store for active development builds. | Stores frequent iterations and daily builds (e.g., v1.0.1-SNAPSHOT). |
| **Hosted**	| docker-trainwithats-hosted | A private registry for internal container images. | Used for docker push (Port 8083) of application images. |
| **Group**	| maven-public	| A "Virtual" umbrella that combines all Maven repos into one URL. | Provides a single endpoint for developers; prioritizes internal code over public code. |
| **Group**	| docker-trainwithats-group	| Combines private images and Docker Hub proxies. | Used for docker pull (Port 8082) for all environments. |

----------

## 7. Troubleshooting for Developers

-   **"Artifact Not Found":** Run `mvn clean install -U`. The `-U` forces Maven to re-check the Nexus server for updated Snapshots.

-   **"401 Unauthorized":** Ensure the `<id>` in your `pom.xml` (`rankx-nexus`) exactly matches the `<id>` in your `settings.xml`.

-   **"404 Not Found":** Double-check the URL. Nexus URLs in this project always require the `/nexus/` context path.

-   **Docker Pull Failure:** If you are on an M4 Mac and the server is Linux, ensure you build with `--platform linux/amd64`.


----------

## 8. Essential Maven Commands for RankX

| **Command** | **Lifecycle Phase** | **What it does** | **When to use it** |
|-------------|---------------------|------------------|--------------------|

| `mvn clean` | **Clean** | Deletes the `target/` folder and all previous build artifacts. |Always run this before a new build to avoid "stale" code issues.|

| `mvn compile`| **Compile** | Converts `.java` source code into `.class` bytecode.| Quick check to see if your code has syntax errors.|

| `mvn test` | **Test** | Runs unit tests using frameworks like JUnit or TestNG. |Mandatory before pushing code to the team.|

| `mvn package` | **Package** | Compiles the code and bundles it into a `.jar` or `.war` file. |To generate a file for local testing or Docker builds.|

| `mvn install` | **Install** | Packages the JAR and puts it in your **Local Repository** (`~/.m2/repository`). |When you want other local projects on your PC to use this library.|

| `mvn deploy` | **Deploy** | Packages the JAR and uploads it to the **RankX Nexus Server**. | |When you want to share your work with the team or prepare for production. |


----------

## 9. Advanced & Troubleshooting Commands

### A. Force Update Dependencies

If a teammate pushed a new version of a library to Nexus but your Maven is still using an old cached version:

Bash

```
mvn clean install -U

```

-   **`-U` (Update):** Forces Maven to check the RankX server for newer Snapshot versions.


### B. Skip Tests for Speed

If you are confident in your code and need a fast deployment to Nexus:

Bash

```
mvn clean deploy -DskipTests

```

-   **`-DskipTests`:** Compiles the tests but does not execute them.


### C. Build with a Specific Settings File

If you have multiple `settings.xml` files (e.g., one for work, one for personal):

Bash

```
mvn clean install -s /path/to/custom-settings.xml

```

### D. Verify Dependency Tree

To see exactly which versions of libraries are being pulled from the `maven-public` group and identify conflicts:

Bash

```
mvn dependency:tree

```

----------

## 10. The Complete "Production Ready" Build Sequence

When you are ready to move your feature from your local branch to the **RankX Release Repository**, follow this sequence:

1.  **Update the Version:** Ensure `pom.xml` version is correct (e.g., `1.0.2`).

2.  **Run the Build & Push:**

    Bash

    ```
    # Clean, Test, Package, and Upload to Nexus in one go
    mvn clean deploy
    
    ```

3.  **Verify on Nexus UI:**

    -   Open [https://trainwithats.online/nexus](https://trainwithats.online/nexus)

    -   Go to **Browse > maven-trainwithats-release**

    -   Find your artifact and confirm the timestamp.


----------

_Developed by Aditya Sonwane - RankHex DevOps Team_
