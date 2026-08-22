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
const phoneInput = document.getElementById('phone');

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const phoneVal = phoneInput ? phoneInput.value : '';
        const rawPhoneDigits = phoneVal.replace(/\D/g, '');

        // Валидация: 48 + 9 цифр номера = ровно 11 цифр
        if (rawPhoneDigits.length !== 11) {
            alert('Proszę podać poprawny 9-cyfrowy numer telefonu (+48 XXX XXX XXX).');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'Wysyłanie...';

        const payload = {
            name: document.getElementById('name').value,
            city: document.getElementById('city').value,
            phone: phoneVal,
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
                // Отправка события в Google Tag Manager
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({
                    event: 'generate_lead',
                    lead_type: selectedPlanInput ? selectedPlanInput.value : 'Indywidualny dobór',
                    city: document.getElementById('city').value
                });
                // Отправляем событие конверсии в Meta Pixel
                if (typeof fbq === 'function') {
                    fbq('track', 'Lead', {
                        content_name: selectedPlanInput ? selectedPlanInput.value : 'Indywidualny dobór',
                        currency: 'PLN',
                        value: 0.00
                    });
                }
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

// 4. Маска ввода польского номера (+48 XXX XXX XXX)
if (phoneInput) {
    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.trim()) {
            phoneInput.value = '+48 ';
        }
    });

    phoneInput.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '');

        if (!digits.startsWith('48')) {
            digits = '48' + digits;
        }

        digits = digits.substring(0, 11);

        let formatted = '+48';
        const rest = digits.substring(2);

        if (rest.length > 0) {
            formatted += ' ' + rest.substring(0, 3);
        }
        if (rest.length > 3) {
            formatted += ' ' + rest.substring(3, 6);
        }
        if (rest.length > 6) {
            formatted += ' ' + rest.substring(6, 9);
        }

        e.target.value = formatted;
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value.trim() === '+48' || phoneInput.value.trim() === '+48 ') {
            phoneInput.value = '';
        }
    });
}