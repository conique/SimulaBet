import React, { useEffect } from 'react';
import './TCCPage.css';

function TCCPage() {
    useEffect(() => {
        document.title = "Documentação do TCC";
    }, []);

    const pdfPath = process.env.PUBLIC_URL + '/TCC___Pedro_Vieira.pdf';

    return (
        <div className="tcc-page-container">
            <h2 className="tcc-page-title">Documentação Completa do TCC</h2>
            <div className="pdf-container">
                <iframe src={pdfPath} title="Documentação do TCC" className="pdf-viewer"></iframe>
            </div>
        </div>
    );
}

export default TCCPage;