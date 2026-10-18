

const homePage = document.getElementById("homePage");
const scene = document.getElementById("scene");
// const launchButton = document.getElementById("launchButton");
const dateInput = document.getElementById("dateDate");

const cards = [...document.querySelectorAll(".card")];

const correctDate = "2025-10-21";

const settings = {
    spawnDuration: 650,
    spawnDelay: 45,
    startSpeed: 3.2,
    minSpeed: 0.7,
    maxSpeed: 4.5,
    friction: 0.999,
    mouseRadius: 180,
    mouseForce: 0.13
};

let width = window.innerWidth;
let height = window.innerHeight;

let mouse = { x: -10000, y: -10000 };
let objects = [];
let lastTime = 0;

let animationStarted = false;
let selectedCard = null;
let openingCard = false;
let animationFrame = null;

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    // При изменении размера окна удерживаем
    // открытую карточку в центре.
    if (selectedCard) {
        const object = objects.find(
            item => item.element === selectedCard
        );

        if (object) {
            const openW = Math.min(width * 0.88, 600);
            const openH = Math.min(height * 0.78, 720);

            object.x = (width - openW) / 2;
            object.y = (height - openH) / 2;

            selectedCard.style.transform =
                `translate3d(${object.x}px, ${object.y}px, 0) rotate(0deg) scale(1)`;
        }
    }
}

window.addEventListener("resize", resize);

// ========================================
// ЗАПУСК СЦЕНЫ
// ========================================

function startCardAnimation() {
    if (animationStarted) return;

    animationStarted = true;

    // launchButton.disabled = true;
    dateInput.disabled = true;

    homePage.style.opacity = "0";
    homePage.style.pointerEvents = "none";

    setTimeout(() => {
        homePage.style.display = "none";

        scene.classList.add("visible");

        requestAnimationFrame(() => {
            prepareCards();
            startMinions();
        });
    }, 650);
}

// Запуск по кнопке
// launchButton.addEventListener("click", startCardAnimation);

// Запуск при правильной дате
dateInput.addEventListener("change", function () {
    if (!this.value) return;

    const selectedDate = this.value;

    console.log("Выбрана дата:", selectedDate);
    console.log("Правильная дата:", correctDate);

    if (selectedDate === correctDate) {
        startCardAnimation();
    } else {
        alert("Да бля...");
        this.value = "";
    }
});

// ========================================
// ПОДГОТОВКА КАРТОЧЕК
// ========================================

function prepareCards() {
    objects = [];
    lastTime = 0;

    cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();

        const w = rect.width || 180;
        const h = rect.height || 230;

        const centerX = width / 2 - w / 2;
        const centerY = height / 2 - h / 2;

        const angle = index * 2.399963 + random(-0.2, 0.2);

        const speed = random(
            settings.startSpeed * 0.65,
            settings.startSpeed * 1.35
        );

        const object = {
            element: card,

            x: centerX,
            y: centerY,

            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,

            w,
            h,

            angle: random(-20, 20),
            spin: random(-0.5, 0.5),

            bornAt: performance.now() + index * settings.spawnDelay,

            opacity: 0,
            scale: 0,

            // Сохраняем положение перед раскрытием
            savedX: centerX,
            savedY: centerY,
            savedAngle: 0
        };

        objects.push(object);

        card.style.zIndex = String(10 + index);
        card.style.opacity = "0";
        card.style.transition = "none";

        card.style.transform =
            `translate3d(${centerX}px, ${centerY}px, 0) rotate(0deg) scale(0)`;

        // Нажатие на саму карточку
        card.addEventListener("click", event => {
            if (event.target.closest(".close-card")) return;

            openCard(object);
        });

        // Кнопка возврата на каждой карточке
        const closeButton = card.querySelector(".close-card");

        closeButton.addEventListener("click", event => {
            event.stopPropagation();
            closeCard(object);
        });
    });

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    animationFrame = requestAnimationFrame(animate);
}

// ========================================
// ОТКРЫТИЕ КАРТОЧКИ
// ========================================

function openCard(object) {
    if (selectedCard || openingCard) return;
    if (object.opacity < 0.95) return;

    openingCard = true;
    selectedCard = object.element;

    const card = object.element;

    // Запоминаем точное положение карточки
    object.savedX = object.x;
    object.savedY = object.y;
    object.savedAngle = object.angle;

    // Останавливаем карточку на время просмотра
    object.savedVx = object.vx;
    object.savedVy = object.vy;
    object.savedSpin = object.spin;

    object.vx = 0;
    object.vy = 0;
    object.spin = 0;

    // Поднимаем её над всеми остальными
    card.style.zIndex = "10000";

    // Включаем плавную анимацию раскрытия
    card.style.transition =
        "transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1), " +
        "width 500ms cubic-bezier(0.2, 0.8, 0.2, 1), " +
        "height 500ms cubic-bezier(0.2, 0.8, 0.2, 1), " +
        "border-radius 500ms ease, box-shadow 500ms ease";

    card.classList.add("is-open");

    // Рассчитываем центр раскрытой карточки
    const isMobile = width <= 600;

    const openW = isMobile
        ? width * 0.88
        : Math.min(width * 0.78, 600);

    const openH = isMobile
        ? height * 0.75
        : Math.min(height * 0.78, 720);

    object.x = (width - openW) / 2;
    object.y = (height - openH) / 2;

    object.angle = 0;
    object.scale = 1;

    card.style.transform =
        `translate3d(${object.x}px, ${object.y}px, 0) rotate(0deg) scale(1)`;

    setTimeout(() => {
        openingCard = false;
    }, 520);
}

// ========================================
// ЗАКРЫТИЕ КАРТОЧКИ
// ========================================

function closeCard(object) {
    if (selectedCard !== object.element || openingCard) return;

    openingCard = true;

    const card = object.element;

    // Сначала возвращаем исходный размер
    card.classList.remove("is-open");

    // Возвращаем карточку на прежнее место
    object.x = object.savedX;
    object.y = object.savedY;
    object.angle = object.savedAngle;

    card.style.transform =
        `translate3d(${object.x}px, ${object.y}px, 0) ` +
        `rotate(${object.angle}deg) scale(${object.scale})`;

    setTimeout(() => {
        card.style.transition = "none";

        card.style.zIndex = String(10 + objects.indexOf(object));

        // Возобновляем движение
        object.vx = object.savedVx;
        object.vy = object.savedVy;
        object.spin = object.savedSpin;

        selectedCard = null;
        openingCard = false;
    }, 520);
}

// ========================================
// АНИМАЦИЯ КАРТОЧЕК
// ========================================

function animate(time) {
    if (!lastTime) lastTime = time;

    const delta = Math.min((time - lastTime) / 16.667, 2);
    lastTime = time;

    for (const object of objects) {
        const card = object.element;

        // Открытая карточка управляется отдельно
        if (card === selectedCard) continue;

        // Ещё не появилась
        if (time < object.bornAt) {
            card.style.opacity = "0";
            continue;
        }

        const age = time - object.bornAt;

        // Плавное рождение
        const progress = Math.min(
            age / settings.spawnDuration,
            1
        );

        const eased = 1 - Math.pow(1 - progress, 3);

        object.scale = eased;
        object.opacity = Math.min(progress * 1.8, 1);

        // Разлёт из центра
        object.x += object.vx * delta;
        object.y += object.vy * delta;

        object.vx += random(-0.018, 0.018) * delta;
        object.vy += random(-0.018, 0.018) * delta;

        // Реакция на мышь
        const dx = object.x + object.w / 2 - mouse.x;
        const dy = object.y + object.h / 2 - mouse.y;

        const distance = Math.hypot(dx, dy);

        if (
            distance < settings.mouseRadius &&
            distance > 0
        ) {
            const force =
                (1 - distance / settings.mouseRadius) *
                settings.mouseForce;

            object.vx += dx / distance * force * delta;
            object.vy += dy / distance * force * delta;
        }

        // Ограничение скорости
        let speed = Math.hypot(object.vx, object.vy);

        if (speed > settings.maxSpeed) {
            object.vx = object.vx / speed * settings.maxSpeed;
            object.vy = object.vy / speed * settings.maxSpeed;
        }

        if (speed < settings.minSpeed) {
            speed = speed || 1;

            object.vx = object.vx / speed * settings.minSpeed;
            object.vy = object.vy / speed * settings.minSpeed;
        }

        // Трение
        object.vx *= Math.pow(settings.friction, delta);
        object.vy *= Math.pow(settings.friction, delta);

        // Отскок от границ экрана
        const maxX = Math.max(0, width - object.w);
        const maxY = Math.max(0, height - object.h);

        if (object.x <= 0) {
            object.x = 0;
            object.vx = Math.abs(object.vx);
        } else if (object.x >= maxX) {
            object.x = maxX;
            object.vx = -Math.abs(object.vx);
        }

        if (object.y <= 0) {
            object.y = 0;
            object.vy = Math.abs(object.vy);
        } else if (object.y >= maxY) {
            object.y = maxY;
            object.vy = -Math.abs(object.vy);
        }

        // Вращение
        object.angle += object.spin * delta;

        // Обновляем положение
        card.style.transform =
            `translate3d(${object.x}px, ${object.y}px, 0) ` +
            `rotate(${object.angle}deg) ` +
            `scale(${object.scale})`;

        card.style.opacity = object.opacity;
    }

    animationFrame = requestAnimationFrame(animate);
}

// ========================================
// МЫШЬ
// ========================================

window.addEventListener("mousemove", event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.addEventListener("mouseleave", () => {
    mouse.x = -10000;
    mouse.y = -10000;
});

// ========================================
// ПАДАЮЩИЕ ЦВЕТЫ
// ========================================

const flowersContainer = document.getElementById("flowers");

if (flowersContainer) {
    for (let i = 0; i < 30; i++) {
        const flower = document.createElement("div");

        flower.textContent = "✿";
        flower.style.position = "absolute";
        flower.style.left = Math.random() * 100 + "%";
        flower.style.top = "-40px";
        flower.style.color = "pink";
        flower.style.fontSize = 20 + Math.random() * 25 + "px";

        flowersContainer.appendChild(flower);

        flower.animate(
            [
                {
                    transform: "translate(0, 0) rotate(0deg)"
                },
                {
                    transform: `
                        translate(
                            ${-100 + Math.random() * 200}px,
                            110vh
                        )
                        rotate(${360 + Math.random() * 720}deg)
                    `
                }
            ],
            {
                duration: 5000 + Math.random() * 5000,
                iterations: Infinity,
                easing: "linear"
            }
        );
    }
}



const minionImages = [
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/minion1.png",
    "./photoes/minions/minion2.png",
    "./photoes/minions/minion3.png",
    "./photoes/minions/cat1.png",
    "./photoes/minions/cat2.png",
    "./photoes/minions/cat1.png",
    "./photoes/minions/cat2.png",
    "./photoes/minions/cat1.png",
    "./photoes/minions/cat2.png",
    "./photoes/minions/cat1.png",
    "./photoes/minions/cat2.png",
    "./photoes/minions/cat1.png",
    "./photoes/minions/cat2.png",
];

const minions = [];
let minionsAnimationStarted = false;
let minionsFrame = null;

function startMinions() {
    if (minionsAnimationStarted) return;

    const container = document.getElementById("minionsContainer");
    if (!container) return;

    minionsAnimationStarted = true;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    minionImages.forEach((src, index) => {
        const img = document.createElement("img");

        img.src = src;
        img.alt = "";
        img.className = "minion";
        img.draggable = false;

        container.appendChild(img);

        const size = window.innerWidth <= 600 ? 52 : 75;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;

        minions.push({
            img,
            x: centerX - size / 2,
            y: centerY - size / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            angle: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5,
            size,
            bornAt: performance.now() + index * 180,
            nextTurn: 30 + Math.random() * 100
        });
    });

    animateMinions();
}

function animateMinions() {
    const now = performance.now();
    const width = window.innerWidth;
    const height = window.innerHeight;

    minions.forEach(minion => {
        if (now < minion.bornAt) return;

        const elapsed = now - minion.bornAt;
        const fade = Math.min(elapsed / 600, 1);

        minion.img.style.opacity = fade;

        // Случайно меняем направление полёта
        minion.nextTurn--;

        if (minion.nextTurn <= 0) {
            minion.vx += (Math.random() - 0.5) * 1.8;
            minion.vy += (Math.random() - 0.5) * 1.8;

            minion.nextTurn = 30 + Math.random() * 100;
        }

        // Ограничиваем скорость
        const speed = Math.hypot(minion.vx, minion.vy);
        const maxSpeed = 3.5;

        if (speed > maxSpeed) {
            minion.vx = minion.vx / speed * maxSpeed;
            minion.vy = minion.vy / speed * maxSpeed;
        }

        minion.x += minion.vx;
        minion.y += minion.vy;
        minion.angle += minion.rotationSpeed;

        // Отскок от границ экрана
        if (minion.x <= 0 || minion.x + minion.size >= width) {
            minion.vx *= -1;
            minion.x = Math.max(
                0,
                Math.min(width - minion.size, minion.x)
            );
        }

        if (minion.y <= 0 || minion.y + minion.size >= height) {
            minion.vy *= -1;
            minion.y = Math.max(
                0,
                Math.min(height - minion.size, minion.y)
            );
        }

        minion.img.style.transform =
            `translate(${minion.x}px, ${minion.y}px) rotate(${minion.angle}deg)`;
    });

    minionsFrame = requestAnimationFrame(animateMinions);
}