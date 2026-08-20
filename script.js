const BOT_TOKEN = '8834400777:AAF0R1IudhaJ8RY_LSNTPfOCBsqFg4rGZSw';
const CHAT_ID = '807961898';

// Переключение шагов квиза
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

// Элементы
const planButtons = document.querySelectorAll('.select-plan-btn');
const selectedPlanInput = document.getElementById('selectedPlan');
const startQuizBtn = document.querySelector('.start-quiz-btn');
const orderFormSection = document.getElementById('order-form');

// 1. Клик по тарифам (1, 2, 3) -> открываем форму и сразу Шаг 3
planButtons.forEach(button => {
    button.addEventListener('click', function() {
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

// 2. Клик по карточке 4 "Indywidualny dobór" -> открываем форму и Шаг 1
if (startQuizBtn) {
    startQuizBtn.addEventListener('click', function() {
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

        const area = document.querySelector('input[name="area"]:checked')?.value || 'Не указано';
        const heating = document.querySelector('input[name="heating"]:checked')?.value || 'Не указано';
        const plan = selectedPlanInput ? selectedPlanInput.value : 'Не указано';

        const name = document.getElementById('name').value;
        const city = document.getElementById('city').value;
        const phone = document.getElementById('phone').value;

        const message = `🔥 *Nowy lead z kwizu!*\n\n👤 *Imię:* ${name}\n📍 *Miasto:* ${city}\n📞 *Telefon:* ${phone}\n\n🏡 *Powierzchnia:* ${area}\n🔥 *Aktualne ogrzewanie:* ${heating}\n📦 *Pakiet:* ${plan}`;

        try {
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
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