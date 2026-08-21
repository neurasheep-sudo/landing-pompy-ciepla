// URL твоего защищенного бессерверного шлюза
const WORKER_URL = 'https://round-shadow-fdc2.neura-sheep.workers.dev';

// Считываем UTM-метки из URL при загрузке страницы
const urlParams = new URLSearchParams(window.location.search);
const utmSource = urlParams.get('utm_source') || 'Direct / Organic';
const utmCampaign = urlParams.get('utm_campaign') || 'none';
// 1. Функции переключения шагов квиза
function nextStep(currentStep) {
    const currentStepEl = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    const checkedOption = currentStepEl.querySelector('input[type="radio"]:checked');

    if (!checkedOption) {
        alert('Proszę wybrać jedną z opcji przed przejściem dalej.');
        return;
    }

    currentStepEl.classList.remove('active');
    const nextStepEl = document.querySelector(`.quiz-step[data-step="${currentStep + 1}"]`);
    if (nextStepEl) {
        nextStepEl.classList.add('active');
    }
}

function prevStep(currentStep) {
    const currentStepEl = document.querySelector(`.quiz-step[data-step="${currentStep}"]`);
    currentStepEl.classList.remove('active');
    const prevStepEl = document.querySelector(`.quiz-step[data-step="${currentStep - 1}"]`);
    if (prevStepEl) {
        prevStepEl.classList.add('active');
    }
}

// 2. Элементы интерфейса
const planButtons = document.querySelectorAll('.select-plan-btn');
const selectedPlanInput = document.getElementById('selectedPlan');
const startQuizBtn = document.querySelector('.start-quiz-btn');
const orderFormSection = document.getElementById('order-form');

// Клик по готовым тарифам (1, 2, 3) -> сброс квиза, открытие формы и сразу Шаг 3
planButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Очищаем все radio-кнопки
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });

        const chosenPlan = this.getAttribute('data-plan');
        if (selectedPlanInput) {
            selectedPlanInput.value = chosenPlan;
        }

        if (orderFormSection) {
            orderFormSection.style.display = 'block';
        }

        document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
        const step3 = document.querySelector('.quiz-step[data-step="3"]');
        if (step3) {
            step3.classList.add('active');
        }

        if (orderFormSection) {
            orderFormSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Клик по 4-й карточке "Indywidualny dobór" -> открытие формы и Шаг 1
if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function () {
        if (selectedPlanInput) {
            selectedPlanInput.value = 'Indywidualny dobór (z kwizu)';
        }

        if (orderFormSection) {
            orderFormSection.style.display = 'block';
        }

        document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
        const step1 = document.querySelector('.quiz-step[data-step="1"]');
        if (step1) {
            step1.classList.add('active');
        }

        if (orderFormSection) {
            orderFormSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// 3. Отправка формы в Telegram
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        submitBtn.disabled = true;
        submitBtn.innerText = 'Wysyłanie...';

        const payload = {
            name: document.getElementById('name').value,
            city: document.getElementById('city').value,
            phone: document.getElementById('phone').value,
            plan: selectedPlanInput ? selectedPlanInput.value : 'Nie wybrano',
            area: document.querySelector('input[name="area"]:checked')?.value || '',
            heating: document.querySelector('input[name="heating"]:checked')?.value || '',
            utmSource: utmSource,
            utmCampaign: utmCampaign
        };

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                submitBtn.style.backgroundColor = '#28a745';
                submitBtn.innerText = 'Dziękujemy! Odezwiemy się.';
                form.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '#0066cc';
                    submitBtn.innerText = 'Odbierz wycenę';
                    if (orderFormSection) {
                        orderFormSection.style.display = 'none';
                    }
                    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
                    const step1 = document.querySelector('.quiz-step[data-step="1"]');
                    if (step1) {
                        step1.classList.add('active');
                    }
                }, 3000);

            } else {
                throw new Error('Błąd wysyłania');
            }
        } catch (error) {
            console.error(error);
            submitBtn.style.backgroundColor = '#dc3545';
            submitBtn.innerText = 'Błąd! Spróbuj ponownie.';
            submitBtn.disabled = false;
        }
    });
}