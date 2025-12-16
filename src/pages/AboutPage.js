import React, { useEffect } from 'react';
import './AboutPage.css';

function AboutPage() {
    useEffect(() => {
        document.title = "Sobre o SimulaBet";
    }, []);

    return (
        <div className="about-page-container">
            <h2 className="about-page-title">Sobre o Projeto SimulaBet</h2>
            <div className="about-content">
                <p>
                    O SimulaBet é um projeto de Trabalho de Conclusão de Curso focado no desenvolvimento de uma aplicação que simula jogos de cassino online. O objetivo principal é demonstrar de forma interativa e educativa a matemática por trás desses jogos, como as probabilidades de ganho do jogador e a vantagem da casa. A aplicação é uma ferramenta educacional que busca preencher a lacuna de compreensão sobre as baixas probabilidades de ganho em jogos de azar, o que pode colaborar para a redução de comportamentos compulsivos.
                </p>
                <p>
                    A plataforma inclui três jogos: a Slot Machine, que demonstra a aleatoriedade e pagamentos baseados em combinações de rolos; a Roleta Americana, que explora a matemática de diferentes tipos de aposta; e o Crash, que foca na tomada de decisão em tempo real. O projeto foi desenvolvido em ReactJS, com o código versionado em Git e hospedado publicamente no GitHub.
                </p>
            </div>
        </div>
    );
}

export default AboutPage;