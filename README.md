# Innoscripta Frontend Assessment

A modern **React + TypeScript** frontend project containerized with **Docker** for easy deployment and reproducibility.

---

## 1. Clone the Repository

```bash
git clone https://github.com/trevor900trill/innoscripta-case-study.git

```

---

## Build and Run with Docker

### Build the Docker image

```bash
docker build -t innoscripta-frontend .
```

### Run the container

```bash
docker run -p 3000:3000 innoscripta-frontend
```

Then open your browser at:
[http://localhost:3000](http://localhost:3000)
