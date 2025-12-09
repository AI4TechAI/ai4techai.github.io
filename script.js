async function verificarCertificado() {
    const id = document.getElementById("codigo").value.trim();

    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "<p>Verificando...</p>";

    try {
        const response = await fetch("certificados.json");
        const dados = await response.json();

        if (dados[id]) {
            const c = dados[id];

            resultadoDiv.innerHTML = `
                <h2>Certificado Encontrado</h2>
                <p><strong>Status:</strong> ${c.status}</p>
                <p><strong>Nome:</strong> ${c.nome}</p>
                <p><strong>Curso:</strong> ${c.curso}</p>
                <p><strong>Carga horária:</strong> ${c.carga_horaria} horas</p>
                <p><strong>Data de emissão:</strong> ${c.data_emissao}</p>
                <p><strong>Instrutores:</strong> ${c.instrutores.join(", ")}</p>
                <p><strong>Parceiros:</strong> ${c.parceiros.join(", ")}</p>
                <p><strong>Observações:</strong> ${c.observacoes}</p>
            `;
        } else {
            resultadoDiv.innerHTML = "<p style='color:red'><strong>Certificado não encontrado.</strong></p>";
        }

    } catch (e) {
        resultadoDiv.innerHTML = "<p style='color:red'>Erro ao carregar banco de certificados.</p>";
    }
}

// Verificar automaticamente pelo parâmetro "?id="
window.onload = function() {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (id) {
        document.getElementById("codigo").value = id;
        verificarCertificado();
    }
};
