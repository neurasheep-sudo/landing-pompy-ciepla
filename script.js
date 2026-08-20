const BOT_TOKEN = '8834400777:AAF0R1IudhaJ8RY_LSNTPfOCBsqFg4rGZSw';
const CHAT_ID = '807961898';

// Функции переключения шагов
function nextStep(currentStep) {
    // Проверяем, выбран ли радио-баттон на текущем шаге
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

// Привязка выбора тарифов из карточек
const planButtons = document.querySelectorAll('.select-plan-btn');
const selectedPlanInput = document.getElementById('selectedPlan');

planButtons.forEach(button => {
    button.addEventListener('click', function() {
        const chosenPlan = this.getAttribute('data-plan');
        selectedPlanInput.value = chosenPlan;
        
        // Сразу переключаем квиз на 3-й шаг (к контактам)
        document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
        document.querySelector('.quiz-step[data-step="3"]').classList.add('active');
        
        document.getElementById('order-form').scrollIntoView({ behavior: 'smooth' });
    });
});

// Отправка формы в Telegram
const form = document.getElementById('leadForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerText = 'Wysyłanie...';

    // Забираем данные квиза
    const area = document.querySelector('input[name="area"]:checked')?.value || 'Не указано';
    const heating = document.querySelector('input[name="heating"]:checked')?.value || 'Не указано';
    const plan = selectedPlanInput.value;

    // Забираем контакты
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
                // Возвращаем квиз на шаг 1
                document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
                document.querySelector('.quiz-step[data-step="1"]').classList.add('active');
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