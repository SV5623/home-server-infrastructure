# Home Server Infrastructure

[🇺🇦 Українська](README_UA.md) · [🇬🇧 English](README.md)

Git-джерело істини для конфігурації та документації мого домашнього сервера.

Конфігурація організована як незалежні Docker Stacks і керується через Portainer:

```text
Git-репозиторій
      ↓
Portainer
      ↓
Docker Stacks
      ↓
Домашній сервер
```

## Документація

- [Storage](docs/storage.md) — постійні дані, volumes та зовнішнє сховище
- [Backup](docs/backup.md) — пріоритети резервного копіювання та дані поза Git
- [Recovery](docs/recovery.md) — відновлення сервера та сервісів

## Структура репозиторію

```text
Конфігурація → stacks/
Host/network документація → infrastructure/
Операційна документація → docs/
```

Інфраструктура розрахована переважно на **доступ із локальної мережі та через приватну VPN-мережу** і не передбачає прямого публічного доступу до внутрішніх сервісів.

---

## Огляд

### Сервер

| Компонент | Деталі |
|---|---|
| Обладнання | Dell Inspiron 3583 |
| ОС | Fedora Linux 43 Workstation |
| Архітектура | x86-64 |
| Container runtime | Docker 29.6.2 |
| Docker Compose | 5.3.1 |
| Контейнерна мережа | Docker bridge networks |
| Основна Docker-мережа | `server` |
| Firewall | firewalld |
| VPN | Tailscale |
| DNS | Pi-hole |
| Reverse proxy | Caddy |
| Керування контейнерами | Portainer |

Основний робочий каталог Docker:

```text
/home/s623/docker
```

---

## Архітектура

Сервер побудований із декількох основних рівнів:

```text
                         ┌─────────────────────┐
                         │       Internet      │
                         └──────────┬──────────┘
                                    │
                              Tailscale VPN
                                    │
                         ┌──────────▼──────────┐
                         │       Server        │
                         │   Fedora Linux      │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                  Pi-hole        Caddy         Docker
                     │              │              │
                  DNS only     Reverse Proxy    Containers
                                    │
                              Docker network
                                `server`
```

Сервер забезпечує:

- локальне DNS-розпізнавання через Pi-hole;
- приватний віддалений доступ через Tailscale;
- reverse proxy через Caddy;
- запуск сервісів у Docker;
- централізоване керування контейнерами через Portainer;
- моніторинг через Prometheus, Grafana, cAdvisor та Node Exporter.

---

# Мережа

Сервер має два основні способи доступу.

### Локальна мережа

```text
192.168.0.105
```

Сервіси, опубліковані на хості, можуть бути доступні безпосередньо з локальної мережі.

Приклад:

```text
http://192.168.0.105:<port>
```

### Tailscale

```text
100.81.82.102
```

Tailscale забезпечує приватне VPN-з'єднання із сервером з авторизованих пристроїв.

Приклад:

```text
http://100.81.82.102:<port>
```

Tailscale використовується замість прямого відкриття адміністративних та внутрішніх сервісів у публічний Інтернет.

---

# DNS

Pi-hole використовується як локальний DNS-сервер та фільтр DNS-запитів для мережі.

Для локальних сервісів використовується домен:

```text
.home.arpa
```

Приклад:

```text
portainer.home.arpa → 192.168.0.105
```

### Локальні hostname сервісів

```text
jellyfin.home.arpa
grafana.home.arpa
prometheus.home.arpa
pihole.home.arpa
immich.home.arpa
portainer.home.arpa
crafty.home.arpa
home.home.arpa
uptime.home.arpa
snapotter.home.arpa
glances.home.arpa
typing.home.arpa
obsidian.home.arpa
```

---

# Потік запиту

Для сервісів, які працюють через Caddy, типовий потік виглядає так:

```text
Client
  │
  ▼
Pi-hole DNS
  │
  └── service.home.arpa
          │
          ▼
    192.168.0.105
          │
          ▼
       Caddy
       :443
          │
          ▼
   Reverse proxy
          │
          ▼
 Docker container
```

Наприклад:

```text
grafana.home.arpa
        │
        ▼
192.168.0.105
        │
        ▼
Caddy
        │
        ▼
grafana:3000
```

Контейнери, підключені до однієї Docker-мережі, взаємодіють через Docker service/container names, а не через IP сервера.

---

# Docker networking

Для взаємодії між сервісами використовується спільна зовнішня Docker bridge network:

```text
server
```

Сервіси, яким потрібно взаємодіяти з Caddy або іншими внутрішніми сервісами, підключаються до цієї мережі.

Приклад:

```yaml
networks:
  server:
    external: true
```

Окремі Compose-проєкти також можуть мати власні ізольовані мережі.

---

# Сервіси

## Інфраструктура

| Сервіс | Призначення |
|---|---|
| Fedora Linux | Операційна система сервера |
| Docker | Container runtime |
| Docker Compose | Оркестрація контейнерів |
| Portainer | Керування Docker |
| Caddy | Reverse proxy |
| Tailscale | Приватний VPN-доступ |
| Pi-hole | DNS та DNS-фільтрація |

## Моніторинг

| Сервіс | Призначення |
|---|---|
| Prometheus | Збір метрик |
| Grafana | Візуалізація метрик |
| Node Exporter | Метрики хоста |
| cAdvisor | Метрики контейнерів |
| Glances | Моніторинг системи |
| Uptime Kuma | Моніторинг доступності сервісів |

## Медіа та дані

| Сервіс | Призначення |
|---|---|
| Jellyfin | Медіасервер |
| Immich | Керування фотографіями та відео |
| Snapotter | Сервіс для роботи зі скріншотами/зображеннями |
| Obsidian Remote | Віддалене середовище Obsidian |

## Інші сервіси

| Сервіс | Призначення |
|---|---|
| Homepage | Центральна панель сервісів |
| Crafty Controller | Керування Minecraft-серверами |
| Typing SVG | Власний сервіс для README з ефектом друку |

---

# Reverse Proxy

Caddy є основним reverse proxy сервера.

Він слухає:

```text
80/tcp
443/tcp
```

Конфігурація Caddy знаходиться тут:

```text
/home/s623/docker/caddy/Caddyfile
```

### Поточні маршрути

```text
jellyfin.home.arpa   → jellyfin:8096
grafana.home.arpa    → grafana:3000
prometheus.home.arpa → prometheus:9090
pihole.home.arpa     → pihole:80
immich.home.arpa     → immich-server:2283
portainer.home.arpa  → portainer:9000
crafty.home.arpa     → crafty:8443
home.home.arpa       → homepage:3000
uptime.home.arpa     → uptime-kuma:3001
snapotter.home.arpa  → snapotter:1349
glances.home.arpa    → glances:61208
typing.home.arpa     → typing-svg:8000
obsidian.home.arpa   → obsidian:8080
```

Caddy взаємодіє з контейнерами через спільну Docker-мережу `server`.

Адміністративний API Caddy прив'язаний лише до:

```text
localhost:2019
```

---

# Відкриті порти хоста

Лише частина портів контейнерів безпосередньо опублікована на хості.

## SSH

```text
22/tcp
```

Використовується для адміністрування сервера.

## Pi-hole DNS

```text
192.168.0.105:53/tcp
192.168.0.105:53/udp
```

Використовується як DNS-сервер мережі.

## Caddy

```text
0.0.0.0:80/tcp
0.0.0.0:443/tcp
```

Використовується для HTTP/HTTPS reverse proxy.

## Crafty

```text
192.168.0.105:8443/tcp
0.0.0.0:25565/tcp
```

`8443` — вебінтерфейс Crafty.

`25565` — доступ до Minecraft-сервера.

---

## Внутрішні порти контейнерів

Такі порти, як:

```text
3000
8096
9090
9000
3001
61208
8080
```

є внутрішніми Docker-портами та зазвичай доступні через Caddy, а не напряму через host port.

---

# Firewall

На сервері використовується `firewalld`.

Активні зони:

```text
FedoraWorkstation
docker
tailscale
```

### Локальна мережа

Інтерфейси:

```text
enp2s0
wlp3s0
```

### Docker

Docker bridge interfaces призначені до Docker firewall zone.

### Tailscale

```text
tailscale0
```

---

# Відкритий діапазон портів для розробки

Firewall наразі дозволяє:

```text
2500-8900/tcp
2500-8900/udp
```

на основній зоні сервера та зоні Tailscale.

Це дозволяє використовувати різні порти для локальних проєктів без створення окремого firewall rule для кожного порту.

Відкриття порту у firewall **не означає автоматичної публікації Docker-сервісу**.

Сервіс також повинен:

1. опублікувати порт через Docker; або
2. слухати порт безпосередньо на хості.

---

# SSH

SSH використовується для адміністрування сервера.

### Локальна мережа

```bash
ssh s623@192.168.0.105
```

### Через Tailscale

```bash
ssh s623@100.81.82.102
```

Конфігурація hardening SSH:

```text
/etc/ssh/sshd_config.d/99-hardening.conf
```

Поточна конфігурація:

```text
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
```

Таким чином SSH використовує автентифікацію через public key, а вхід root через SSH заборонений.

---

# Storage

Основний каталог Docker:

```text
/home/s623/docker
```

Постійні дані сервісів зберігаються через комбінацію:

- bind mounts;
- Docker named volumes;
- окремих каталогів сервісів.

Приклади:

```text
/home/s623/docker/immich/library
/home/s623/docker/immich/postgres
/home/s623/docker/pihole/etc-pihole
/home/s623/docker/homepage/config
/home/s623/docker/uptime-kuma
/home/s623/docker/crafty
```

Деякі сервіси використовують Docker named volumes, наприклад:

```text
caddy_caddy_data
caddy_caddy_config
immich_model-cache
jellyfin_jellyfin-cache
jellyfin_jellyfin-config
monitoring_grafana-data
monitoring_prometheus-data
snapotter_snapotter-data
```

---

# Зовнішнє сховище

Сервер монтує мережеве сховище з іншої машини через SMB/CIFS.

### Movies

```text
/mnt/movies
```

Джерело:

```text
//192.168.0.103/Movies
```

Монтується у режимі read-only.

### Music

```text
/mnt/music
```

Джерело:

```text
//192.168.0.103/Music
```

Монтується у режимі read-write.

Jellyfin використовує ці каталоги як медіабібліотеки.

---

# Моніторинг

Моніторинг побудований так:

```text
Node Exporter
       │
       ▼
  Prometheus
       │
       ├── Node metrics
       └── cAdvisor metrics
              │
              ▼
           Grafana
```

Prometheus збирає метрики з:

```text
node-exporter:9100
cadvisor:8080
```

Інтервал збору:

```text
60 seconds
```

Зберігання даних Prometheus:

```text
15 days
```

Конфігурація:

```text
/home/s623/docker/prometheus/prometheus.yml
```

---

# Minecraft

Minecraft-інфраструктура працює через Crafty Controller.

Crafty забезпечує:

- керування Minecraft-серверами;
- вебадміністрування;
- файли серверів;
- резервні копії;
- логи.

Minecraft використовує:

```text
25565/tcp
```

Тип сервера:

```text
Fabric
Minecraft 1.21.1
```

Дані Minecraft зберігаються окремо від контейнера.

---

# Portainer

Portainer використовується для керування Docker-контейнерами та Compose stacks.

Постійні дані Portainer:

```text
/home/s623/docker/portainer/data
```

Docker socket монтується у Portainer:

```text
/var/run/docker.sock
```

Compose-файли, керовані Portainer, зберігаються:

```text
/home/s623/docker/portainer/data/compose
```

Ці файли відображають поточну конфігурацію Portainer stacks, але вважаються runtime management data, а не структурою Git-репозиторію.

---

# Docker Stacks

Поточна інфраструктура містить такі Portainer-managed stacks:

```text
caddy
monitoring
jellyfin
immich
homepage
uptime-kuma
pihole
portainer
crafty
snapotter
docker-socket-proxy
glances
obsidian
minecraft
typing-svg
```

Частина сервісів керується безпосередньо через Portainer, інші мають локальні Compose-файли в `/home/s623/docker`.

---

# Docker Socket Proxy

Glances не має прямого доступу до Docker socket.

Замість цього використовується:

```text
Glances
   │
   ▼
Docker Socket Proxy
   │
   ▼
Docker socket
```

Docker Socket Proxy відкриває лише необхідні read-oriented API endpoints.

Write-oriented Docker operations, зокрема:

```text
POST
BUILD
EXEC
SERVICES
VOLUMES
NETWORKS
```

вимкнені.

Це обмежує Docker API permissions, доступні сервісам моніторингу.

---

# Безпека

Сервер призначений переважно для доступу з довіреної локальної мережі та через приватну VPN-мережу.

Основні принципи:

- сервіси не повинні відкриватися в публічний Інтернет без необхідності;
- адміністративні інтерфейси бажано використовувати через Tailscale або Caddy;
- кількість Docker-published ports потрібно мінімізувати;
- внутрішні бази даних повинні залишатися всередині Docker networks;
- паролі та API keys зберігаються поза Git;
- SSH використовує public-key authentication;
- root SSH login вимкнений;
- доступ до Docker Socket повинен бути обмежений;
- резервні копії повинні зберігатися окремо від основного сервера.

---

# Secrets

Секрети ніколи не повинні потрапляти до цього репозиторію.

Наприклад:

```text
.env
.env.*
stack.env
*.pem
*.key
*.p12
*.pfx
id_*
```

Compose-конфігурації повинні використовувати environment variables для чутливих значень.

Приклад:

```yaml
environment:
  DB_PASSWORD: ${IMMICH_DB_PASSWORD}
```

Фактичне значення зберігається в Portainer або іншому локальному механізмі зберігання секретів.

---

# Backup strategy

Найважливіші дані для резервного копіювання:

```text
Application configuration
Databases
Immich library
Crafty server data
Minecraft data
Obsidian vaults
Persistent Docker volumes
Caddy data/configuration
Pi-hole configuration
Portainer configuration
```

Тимчасові або кешовані дані можуть бути відновлені/створені заново:

```text
Prometheus cache
Jellyfin cache
Immich ML model cache
temporary container files
```

Git-репозиторій зберігає **конфігурацію та опис інфраструктури**, а не бази даних чи великі persistent datasets.

---

# Відновлення

Новий сервер повинен бути відновлюваним за наступною схемою:

```text
1. Install Fedora
2. Install Docker
3. Create Docker network `server`
4. Restore required configuration
5. Restore secrets
6. Restore persistent application data
7. Deploy Compose projects
8. Configure Pi-hole DNS
9. Configure Tailscale
10. Configure firewalld
11. Configure Caddy
12. Verify service connectivity
```

Мета цього репозиторію — зробити інфраструктуру відтворюваною без зберігання секретних або великих runtime data у Git.

---

# Корисні команди

### Контейнери

```bash
docker ps
docker ps -a
```

### Compose projects

```bash
docker compose ls
```

### Networks

```bash
docker network ls
docker network inspect server
```

### Volumes

```bash
docker volume ls
```

### Опубліковані порти

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

### Відкриті TCP-порти

```bash
sudo ss -ltnp
```

### Відкриті UDP-порти

```bash
sudo ss -lunp
```

### Firewall

```bash
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all-zones
```

### Tailscale

```bash
tailscale status
```

### DNS

```bash
dig @192.168.0.105 portainer.home.arpa
```

### Перевірка локального сервісу

```bash
curl http://192.168.0.105:<port>
```

---

# Структура репозиторію

Репозиторій призначений для зберігання:

```text
home-server-infrastructure/
├── README.md
├── README_UA.md
│
├── stacks/
│   ├── caddy/
│   ├── pihole/
│   ├── monitoring/
│   ├── jellyfin/
│   ├── crafty/
│   ├── immich/
│   ├── homepage/
│   ├── uptime-kuma/
│   ├── snapotter/
│   ├── docker-socket-proxy/
│   ├── glances/
│   ├── obsidian/
│   ├── portainer/
│   └── typing-svg/
│
├── infrastructure/
│   ├── network/
│   └── scripts/
│
└── docs/
    ├── storage.md
    ├── backup.md
    └── recovery.md
```

Репозиторій містить санітизовану конфігурацію та документацію.

Persistent runtime data залишається на сервері або в окремих резервних копіях.