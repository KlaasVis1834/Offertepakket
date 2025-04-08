// Stapnavigatie
function nextStep(currentStepId, nextStepId) {
    document.getElementById(currentStepId).classList.remove('active');
    document.getElementById(nextStepId).classList.add('active');

    if (nextStepId === 'step-verzekeringen') {
        toggleVerzekeringen();
    } else if (nextStepId === 'step-details') {
        toggleDetails();
    } else if (nextStepId === 'step-gegevens') {
        toggleGegevens();
    }
}

function prevStep(currentStepId, prevStepId) {
    document.getElementById(currentStepId).classList.remove('active');
    document.getElementById(prevStepId).classList.add('active');
}

// Toon verzekeringen op basis van aanschaf
function toggleVerzekeringen() {
    const aanschaf = document.querySelector('input[name="aanschaf"]:checked').value;
    const particulier = document.getElementById('verzekeringen-particulier');
    const zakelijk = document.getElementById('verzekeringen-zakelijk');
    
    particulier.classList.toggle('hidden', aanschaf !== 'particulier');
    zakelijk.classList.toggle('hidden', aanschaf !== 'zakelijk');

    updatePackageDiscount();
}

// Toon aanvullende vragen
function toggleDetails() {
    const verzekeringen = document.querySelectorAll('input[name="verzekeringen"]:checked');
    const detailsSections = document.querySelectorAll('.details-section');

    detailsSections.forEach(section => section.classList.add('hidden'));

    verzekeringen.forEach(verzekering => {
        const sectionId = `details-${verzekering.id}`;
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
        }
    });
}

// Toon klantgegevens op basis van aanschaf
function toggleGegevens() {
    const aanschaf = document.querySelector('input[name="aanschaf"]:checked').value;
    const particulier = document.getElementById('gegevens-particulier');
    const zakelijk = document.getElementById('gegevens-zakelijk');
    
    particulier.classList.toggle('hidden', aanschaf !== 'particulier');
    zakelijk.classList.toggle('hidden', aanschaf !== 'zakelijk');
}

// Pakketkorting animatie
function updatePackageDiscount() {
    const checkboxes = document.querySelectorAll('input[name="verzekeringen"]:checked');
    const count = checkboxes.length;
    const discountBar = document.getElementById('package-discount');
    const levels = document.querySelectorAll('.discount-level');

    discountBar.classList.toggle('hidden', count === 0);
    levels.forEach(level => level.classList.remove('active'));
    if (count === 1) levels[0].classList.add('active');
    else if (count === 2) levels[1].classList.add('active');
    else if (count >= 3) levels[2].classList.add('active');
}

// Bedragvelden tonen/verbergen
function toggleAmountField(fieldId, isChecked) {
    const field = document.getElementById(fieldId);
    field.classList.toggle('hidden', !isChecked);
    if (!isChecked) field.value = ''; // Reset waarde als uitgeschakeld
}

// API-integraties
async function fetchPostcodeData() {
    const postcode = document.getElementById('postcode').value.replace(/\s/g, '');
    const huisnummer = document.getElementById('huisnummer').value;
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data.response.docs[0];
        document.getElementById('straat').value = adres.straatnaam || '';
        document.getElementById('plaats').value = adres.woonplaatsnaam || '';
    } catch (error) {
        console.error('Fout bij ophalen postcodegegevens:', error);
        document.getElementById('straat').value = '';
        document.getElementById('plaats').value = '';
    }
}

async function fetchPostcodeDataZakelijk() {
    const postcode = document.getElementById('postcode-zakelijk').value.replace(/\s/g, '');
    const huisnummer = document.getElementById('huisnummer-zakelijk').value;
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data.response.docs[0];
        document.getElementById('adres-zakelijk').value = adres.straatnaam || '';
        document.getElementById('plaats-zakelijk').value = adres.woonplaatsnaam || '';
    } catch (error) {
        console.error('Fout bij ophalen postcodegegevens zakelijk:', error);
        document.getElementById('adres-zakelijk').value = '';
        document.getElementById('plaats-zakelijk').value = '';
    }
}

async function fetchPostcodeDataRecreatie() {
    const postcode = document.getElementById('recreatiewoning-postcode').value.replace(/\s/g, '');
    const huisnummer = document.getElementById('recreatiewoning-huisnummer').value;
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode} ${huisnummer}&rows=1`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const adres = data.response.docs[0];
        document.getElementById('recreatiewoning-straat').value = adres.straatnaam || '';
        document.getElementById('recreatiewoning-plaats').value = adres.woonplaatsnaam || '';
    } catch (error) {
        console.error('Fout bij ophalen postcodegegevens recreatiewoning:', error);
        document.getElementById('recreatiewoning-straat').value = '';
        document.getElementById('recreatiewoning-plaats').value = '';
    }
}

async function fetchRDWData(type = '') {
    const kentekenField = type === 'camper' ? 'camper-kenteken' : 'kenteken';
    const merkField = type === 'camper' ? 'camper-merk' : 'merk';
    const modelField = type === 'camper' ? 'camper-model' : 'model';
    const kenteken = document.getElementById(kentekenField).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`;

    const kentekenRegex = /^[A-Z0-9]{2,8}$/;
    if (!kentekenRegex.test(kenteken)) {
        document.getElementById(merkField).value = '';
        document.getElementById(modelField).value = '';
        return;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            const auto = data[0];
            document.getElementById(merkField).value = auto.merk || '';
            document.getElementById(modelField).value = auto.handelsbenaming || '';
        } else {
            document.getElementById(merkField).value = '';
            document.getElementById(modelField).value = '';
        }
    } catch (error) {
        console.error('Fout bij ophalen RDW-gegevens:', error);
        document.getElementById(merkField).value = '';
        document.getElementById(modelField).value = '';
    }
}

// Formulier verzenden
document.getElementById('quote-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const email = formData.get('email');
    let emailBody = "Offerteverzoek Klaas Vis Assurantiekantoor\n\n";

    const aanschaf = formData.get('aanschaf');
    emailBody += `Offertesoort: ${aanschaf}\n\n`;

    // Verzekeringen en details
    const verzekeringen = formData.getAll('verzekeringen');
    emailBody += "Gewenste verzekeringen:\n";
    if (verzekeringen.length > 0) {
        verzekeringen.forEach(verzekering => {
            emailBody += `- ${verzekering}\n`;
            const sectionId = `details-${verzekering.toLowerCase().replace(/\s/g, '-').replace('/', '-')}`;
            const section = document.getElementById(sectionId);
            if (section) {
                emailBody += `  Aanvullende gegevens voor ${verzekering}:\n`;
                const inputs = section.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.type === 'checkbox' && input.checked) {
                        emailBody += `    ${input.name.replace(verzekering.toLowerCase().replace(/\s/g, '-') + '-', '')}: Ja\n`;
                        const amountField = document.getElementById(`${input.name}-amount`);
                        if (amountField && !amountField.classList.contains('hidden') && amountField.value) {
                            emailBody += `      Bedrag: €${amountField.value}\n`;
                        }
                    } else if (input.type !== 'checkbox' && input.value) {
                        emailBody += `    ${input.name.replace(verzekering.toLowerCase().replace(/\s/g, '-') + '-', '')}: ${input.value}\n`;
                    }
                });
            }
        });
    } else {
        emailBody += "Geen geselecteerd\n";
    }

    emailBody += "\nKlantgegevens:\n";
    for (let [key, value] of formData.entries()) {
        if (key !== 'verzekeringen' && key !== 'aanschaf' && !key.includes('-')) {
            emailBody += `${key}: ${value}\n`;
        }
    }

    document.getElementById('loadingScreen').style.display = 'flex';

    emailjs.send("service_lpsiijc", "template_l7dk1hc", {
        message: emailBody,
        reply_to: email
    })
    .then(() => {
        console.log("Kantoor e-mail succesvol verzonden");
        return emailjs.send("service_lpsiijc", "template_ksj01md", {
            to_email: email,
            message: "Bedankt voor uw offerteaanvraag!\n\nHieronder uw ingevulde gegevens:\n" + emailBody
        });
    })
    .then(() => {
        console.log("Klant e-mail succesvol verzonden");
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('resultModal').style.display = 'flex';
        document.getElementById('resultText').innerHTML = `
            <strong>Uw offerteaanvraag is verzonden!</strong><br><br>
            U ontvangt een bevestiging op ${email}. Binnen 5 werkdagen ontvangt u een reactie van ons.
        `;
        form.reset();
        document.getElementById('step-gegevens').classList.remove('active');
        document.getElementById('step-aanschaf').classList.add('active');
    })
    .catch((error) => {
        console.error("Fout bij verzenden:", error);
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('resultModal').style.display = 'flex';
        document.getElementById('resultText').innerHTML = `
            Er is een fout opgetreden: ${error.text}<br>
            Probeer het later opnieuw.
        `;
    });
});

function closeModal() {
    document.getElementById('resultModal').style.display = 'none';
}

// Event listeners voor dynamische updates
document.querySelectorAll('input[name="verzekeringen"]').forEach(checkbox => {
    checkbox.addEventListener('change', updatePackageDiscount);
});

// Chatbase chatbot integratie
(function() {
    if (!window.chatbase || window.chatbase('getState') !== 'initialized') {
        window.chatbase = (...args) => {
            if (!window.chatbase.q) {
                window.chatbase.q = [];
            }
            window.chatbase.q.push(args);
        };
        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if (prop === 'q') {
                    return target.q;
                }
                return (...args) => target(prop, ...args);
            }
        });
    }
    const onLoad = function() {
        const script = document.createElement('script');
        script.src = 'https://www.chatbase.co/embed.min.js';
        script.id = 'C60jEJW_QuVD7X3vE5rzE';
        script.setAttribute('domain', 'www.chatbase.co');
        document.body.appendChild(script);
    };
    if (document.readyState === 'complete') {
        onLoad();
    } else {
        window.addEventListener('load', onLoad);
    }
})();