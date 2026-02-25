/* ── Formulario Anato – Client-side Logic ─────────────────────────── */
(function () {
    'use strict';

    const FORM = document.getElementById('formAnato');
    const TOAST = document.getElementById('toast');
    const BTN = document.getElementById('btnSubmit');
    const OBS = document.getElementById('observacion');
    const OBS_COUNTER = document.getElementById('obsCounter');

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PHONE_RE = /^\d{7,15}$/;

    /* ── Helpers ──────────────────────────────────────────────────────── */
    function showError(id, msg) {
        const grp = document.getElementById(id)?.closest('.form-group');
        if (!grp) return;
        grp.classList.add('has-error');
        const el = grp.querySelector('.form-error');
        if (el) el.textContent = msg;
    }

    function clearError(id) {
        const grp = document.getElementById(id)?.closest('.form-group');
        if (!grp) return;
        grp.classList.remove('has-error');
    }

    function clearAllErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
    }

    function toast(msg, type = 'success') {
        TOAST.textContent = msg;
        TOAST.className = 'toast ' + type + ' show';
        setTimeout(() => TOAST.classList.remove('show'), 4000);
    }

    /* ── Char counter ─────────────────────────────────────────────────── */
    if (OBS && OBS_COUNTER) {
        OBS.addEventListener('input', () => {
            const len = OBS.value.length;
            OBS_COUNTER.textContent = `${len}/500`;
            OBS_COUNTER.classList.toggle('warn', len > 480);
        });
    }

    /* ── Real-time validation on blur ─────────────────────────────────── */
    function attachBlur(id, validator) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('blur', () => {
            const err = validator(el.value);
            if (err) showError(id, err); else clearError(id);
        });
        el.addEventListener('input', () => clearError(id));
    }

    attachBlur('nombre', v => (!v.trim() || v.length > 256) ? 'Nombre y Apellido es requerido (máx 256 caracteres).' : '');
    attachBlur('agencia', v => (!v.trim() || v.length > 200) ? 'Nombre de Agencia es requerido (máx 200 caracteres).' : '');
    attachBlur('cargo', v => (!v.trim() || v.length > 256) ? 'Cargo es requerido (máx 256 caracteres).' : '');
    attachBlur('ciudad', v => (!v.trim() || v.length > 100) ? 'Ciudad es requerida (máx 100 caracteres).' : '');
    attachBlur('correo', v => (!v.trim() || !EMAIL_RE.test(v)) ? 'Ingrese un correo electrónico válido.' : '');
    attachBlur('telefonoNum', v => (!v.trim() || !PHONE_RE.test(v.replace(/\s/g, ''))) ? 'Ingrese un número válido (7-15 dígitos).' : '');

    /* ── Full validation ──────────────────────────────────────────────── */
    function validate() {
        clearAllErrors();
        let valid = true;

        function check(id, msg) {
            showError(id, msg);
            valid = false;
        }

        const nombre = document.getElementById('nombre').value;
        if (!nombre.trim() || nombre.length > 256) check('nombre', 'Nombre y Apellido es requerido (máx 256 caracteres).');

        const agencia = document.getElementById('agencia').value;
        if (!agencia.trim() || agencia.length > 200) check('agencia', 'Nombre de Agencia es requerido (máx 200 caracteres).');

        const cargo = document.getElementById('cargo').value;
        if (!cargo.trim() || cargo.length > 256) check('cargo', 'Cargo es requerido (máx 256 caracteres).');

        const ciudad = document.getElementById('ciudad').value;
        if (!ciudad.trim() || ciudad.length > 100) check('ciudad', 'Ciudad es requerida (máx 100 caracteres).');

        const correo = document.getElementById('correo').value;
        if (!correo.trim() || !EMAIL_RE.test(correo)) check('correo', 'Ingrese un correo electrónico válido.');

        const codigoPais = document.getElementById('codigoPais').value;
        const telefonoNum = document.getElementById('telefonoNum').value.replace(/\s/g, '');
        if (!telefonoNum || !PHONE_RE.test(telefonoNum)) check('telefonoNum', 'Ingrese un número válido (7-15 dígitos).');

        const checks = document.querySelectorAll('input[name="interes"]:checked');
        if (checks.length === 0) check('interesGroup', 'Seleccione al menos un interés.');

        const obs = document.getElementById('observacion').value;
        if (obs.length > 500) check('observacion', 'La observación no puede exceder 500 caracteres.');

        const politica = document.getElementById('acepta_politica');
        if (!politica.checked) check('acepta_politica', 'Debe aceptar la política de tratamiento de datos.');

        if (!valid) return null;

        return {
            nombre: nombre.trim(),
            agencia: agencia.trim(),
            cargo: cargo.trim(),
            ciudad: ciudad.trim(),
            correo: correo.trim(),
            telefono: codigoPais + ' ' + telefonoNum,
            interes: Array.from(checks).map(c => c.value),
            observacion: obs.trim() || null,
            acepta_politica: true
        };
    }

    /* ── Submit ───────────────────────────────────────────────────────── */
    FORM.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = validate();
        if (!data) {
            toast('Por favor corrija los errores en el formulario.', 'error');
            // scroll to first error
            const first = document.querySelector('.form-group.has-error');
            if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        BTN.classList.add('loading');
        BTN.disabled = true;

        try {
            const res = await fetch('/api/formulario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const json = await res.json();

            if (res.ok && json.ok) {
                toast('¡Registro guardado exitosamente!', 'success');
                FORM.reset();
                clearAllErrors();
                if (OBS_COUNTER) OBS_COUNTER.textContent = '0/500';
            } else {
                // server-side errors
                if (json.errors) {
                    Object.entries(json.errors).forEach(([key, msg]) => {
                        const fieldId = key === 'interes' ? 'interesGroup' : key;
                        showError(fieldId, msg);
                    });
                }
                toast(json.message || 'Error al guardar. Verifique los campos.', 'error');
            }
        } catch (err) {
            toast('Error de conexión. Intente nuevamente.', 'error');
            console.error(err);
        } finally {
            BTN.classList.remove('loading');
            BTN.disabled = false;
        }
    });
})();
