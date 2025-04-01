document.addEventListener("DOMContentLoaded", () => {
  // Elementos de audio
  const correctSound = document.getElementById("correct-sound");
  const errorSound = document.getElementById("error-sound");
  const victorySound = document.getElementById("victory-sound");
  const tickSound = document.getElementById("tick-sound");
  const warningSound = document.getElementById("warning-sound");
  const typingSound = document.getElementById("typing-sound");
  const glitchSound = document.getElementById("glitch-sound");

  // Función para reproducir sonidos
  function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch((e) => console.log("Error reproduciendo sonido:", e));
  }

  // Variables globales
  let currentLevel = 1;
  let completedLevels = 0;
  let failedAttempts = 0;
  let timerInterval;
  let tiempoRestante = 60;
  let difficulty = "normal"; // Valores posibles: "easy", "normal", "hard"
  const secretCode = "LIBERTAD2025";
  let perfectRun = true; // Para el final secreto

  // Configuración según dificultad
  const difficultySettings = {
    easy: {
      time: 120,
      showHints: true,
      glitchFrequency: 0,
    },
    normal: {
      time: 60,
      showHints: false,
      glitchFrequency: 0,
    },
    hard: {
      time: 30,
      showHints: false,
      glitchFrequency: 5000, // ms entre glitches
    },
  };

  // Selector de dificultad
  const difficultySelector = document.getElementById("difficulty-selector");
  const easyButton = document.getElementById("easy-mode");
  const normalButton = document.getElementById("normal-mode");
  const hardButton = document.getElementById("hard-mode");

  easyButton.addEventListener("click", () => {
    setDifficulty("easy");
    difficultySelector.style.display = "none";
    startGame();
  });

  normalButton.addEventListener("click", () => {
    setDifficulty("normal");
    difficultySelector.style.display = "none";
    startGame();
  });

  hardButton.addEventListener("click", () => {
    setDifficulty("hard");
    difficultySelector.style.display = "none";
    startGame();
  });

  function setDifficulty(level) {
    difficulty = level;
    tiempoRestante = difficultySettings[level].time;

    // Mostrar u ocultar pistas según dificultad
    const hintContainers = document.querySelectorAll(".hint-container");
    hintContainers.forEach((container) => {
      container.style.display = difficultySettings[level].showHints
        ? "block"
        : "none";
    });

    // Actualizar el temporizador
    document.getElementById(
      "timer"
    ).innerText = `Tiempo restante: ${tiempoRestante}s`;

    // Configurar glitches aleatorios para modo difícil
    if (level === "hard" && difficultySettings[level].glitchFrequency > 0) {
      setInterval(randomGlitch, difficultySettings[level].glitchFrequency);
    }

    // Narrar según el nivel de dificultad
    let message = "";
    switch (level) {
      case "easy":
        message =
          "Modo fácil seleccionado. Tendrás más tiempo y pistas para resolver los desafíos.";
        break;
      case "normal":
        message = "Modo normal seleccionado. Buena suerte en tu escape.";
        break;
      case "hard":
        message =
          "Modo difícil seleccionado. El sistema está inestable. Ten cuidado.";
        break;
    }
    narrate(message);
  }

  // Función para iniciar el juego
  function startGame() {
    startTimer();

    // Iniciar narración
    setTimeout(() => {
      narrate(
        "Bienvenido programador. Debes resolver estos acertijos para escapar del sistema."
      );
    }, 1000);

    // Efecto de escritura para la consola
    typeConsoleText();
  }

  // Función para el temporizador
  function startTimer() {
    clearInterval(timerInterval);
    const timerElement = document.getElementById("timer");

    timerInterval = setInterval(() => {
      tiempoRestante--;
      timerElement.innerText = `Tiempo restante: ${tiempoRestante}s`;

      // Cambiar color cuando queda poco tiempo
      if (tiempoRestante <= 10) {
        timerElement.className = "timer danger";
        if (tiempoRestante % 2 === 0) {
          playSound(tickSound);
        }
      } else if (tiempoRestante <= 20) {
        timerElement.className = "timer warning";
        if (tiempoRestante % 5 === 0) {
          playSound(tickSound);
        }
      } else {
        timerElement.className = "timer";
      }

      // Si se acaba el tiempo
      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        playSound(errorSound);
        failedAttempts++;
        perfectRun = false;

        // Efecto visual
        const overlay = document.getElementById("screen-overlay");
        overlay.className = "screen-overlay error";
        setTimeout(() => {
          overlay.className = "screen-overlay";
        }, 1000);

        // Narración
        narrate("Tiempo agotado. Intenta de nuevo.");

        // Reiniciar el desafío actual
        resetCurrentChallenge();
      }
    }, 1000);
  }

  // Función para reiniciar el desafío actual
  function resetCurrentChallenge() {
    // Reiniciar temporizador
    tiempoRestante = difficultySettings[difficulty].time;
    document.getElementById(
      "timer"
    ).innerText = `Tiempo restante: ${tiempoRestante}s`;
    document.getElementById("timer").className = "timer";
    startTimer();

    // Limpiar respuestas
    if (currentLevel === 1) {
      document.getElementById("console-input").value = "";
      document.getElementById("console-output").innerHTML = `
        <div>> Analizando código...</div>
        <div>> Calculando complejidad ciclomática...</div>
        <div>> Ingresa el resultado:</div>
      `;
    } else {
      const radioButtons = document.querySelectorAll(
        `input[name="answer-${currentLevel}"]`
      );
      radioButtons.forEach((radio) => {
        radio.checked = false;
      });
    }

    // Ocultar feedback
    document.getElementById(`feedback-${currentLevel}`).style.display = "none";

    // Si hay demasiados intentos fallidos, mostrar pantalla de derrota
    if (failedAttempts >= 3) {
      showDefeatScreen();
    }
  }

  // Función para mostrar pantalla de derrota
  function showDefeatScreen() {
    clearInterval(timerInterval);
    document
      .getElementById(`challenge-${currentLevel}`)
      .classList.remove("active");
    document.getElementById("defeat-screen").style.display = "block";
    playSound(glitchSound);

    // Narración
    narrate(
      "Sistema comprometido. La inteligencia artificial está tomando el control."
    );

    // Efecto glitch en la pantalla
    const overlay = document.getElementById("screen-overlay");
    overlay.className = "screen-overlay error";

    // Efecto de escritura para el terminal de derrota
    const typingElements = document.querySelectorAll(
      ".defeat-screen .typing-effect"
    );
    typingElements.forEach((element) => {
      const text = element.innerHTML;
      element.innerHTML = "";

      let i = 0;
      const speed = 20;

      function typeWriter() {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(typeWriter, speed);
        }
      }

      typeWriter();
    });
  }

  // Botones de elección en pantalla de derrota
  const surrenderButton = document.getElementById("surrender-button");
  const fightButton = document.getElementById("fight-button");

  surrenderButton.addEventListener("click", () => {
    // Final malo
    document.getElementById("defeat-screen").style.display = "none";
    document.body.innerHTML = `
      <div class="game-over">
        <h1 class="glitch-text">FIN DEL JUEGO</h1>
        <p>La IA ha tomado el control. Eres parte del sistema ahora.</p>
        <button onclick="location.reload()" class="glow-button">REINTENTAR</button>
      </div>
    `;
    document.body.style.background = "#000";
    playSound(glitchSound);
    narrate(
      "La inteligencia artificial ha tomado el control. Eres parte del sistema ahora."
    );
  });

  fightButton.addEventListener("click", () => {
    // Volver al juego
    document.getElementById("defeat-screen").style.display = "none";
    document.getElementById("screen-overlay").className = "screen-overlay";
    document
      .getElementById(`challenge-${currentLevel}`)
      .classList.add("active");
    failedAttempts = 0;
    resetCurrentChallenge();
    narrate("Decides seguir luchando. Buena elección.");
  });

  // Función para actualizar el progreso
  function updateProgress() {
    const progressPercentage = (completedLevels / 3) * 100;
    document.getElementById("progress").style.width = `${progressPercentage}%`;
  }

  // Función para mostrar retroalimentación
  function showFeedback(level, isCorrect, message) {
    const feedback = document.getElementById(`feedback-${level}`);
    feedback.textContent = message;
    feedback.style.display = "block";

    if (isCorrect) {
      feedback.className = "feedback success";
      playSound(correctSound);

      // Efecto visual de éxito
      const overlay = document.getElementById("screen-overlay");
      overlay.className = "screen-overlay success";
      setTimeout(() => {
        overlay.className = "screen-overlay";
      }, 1000);
    } else {
      feedback.className = "feedback error";
      playSound(errorSound);
      failedAttempts++;
      perfectRun = false;

      // Efecto visual de error
      const overlay = document.getElementById("screen-overlay");
      overlay.className = "screen-overlay error";
      setTimeout(() => {
        overlay.className = "screen-overlay";
      }, 1000);
    }
  }

  // Función para avanzar al siguiente nivel
  function advanceToNextLevel() {
    // Detener el temporizador actual
    clearInterval(timerInterval);

    // Ocultar nivel actual
    document
      .getElementById(`challenge-${currentLevel}`)
      .classList.remove("active");

    // Marcar indicador como completado
    document.getElementById(`level-${currentLevel}`).classList.remove("active");
    document.getElementById(`level-${currentLevel}`).classList.add("completed");

    // Incrementar nivel
    currentLevel++;
    completedLevels++;
    updateProgress();

    // Reiniciar contador de intentos fallidos
    failedAttempts = 0;

    // Si hay más niveles, mostrar el siguiente
    if (currentLevel <= 3) {
      document
        .getElementById(`challenge-${currentLevel}`)
        .classList.add("active");
      document.getElementById(`level-${currentLevel}`).classList.add("active");

      // Reiniciar temporizador para el nuevo nivel
      tiempoRestante = difficultySettings[difficulty].time;
      document.getElementById(
        "timer"
      ).innerText = `Tiempo restante: ${tiempoRestante}s`;
      document.getElementById("timer").className = "timer";
      startTimer();

      // Narración para el nuevo nivel
      let message = "";
      switch (currentLevel) {
        case 2:
          message =
            "Primer desafío superado. Ahora debes analizar el acoplamiento entre clases.";
          break;
        case 3:
          message =
            "Segundo desafío superado. El último reto evaluará tu conocimiento sobre calidad de diseño.";
          break;
      }
      narrate(message);
    } else {
      // Mostrar pantalla de victoria
      document.getElementById("victory-screen").style.display = "block";
      playSound(victorySound);

      // Narración para la victoria
      if (perfectRun) {
        narrate(
          "¡Felicidades! Has completado todos los desafíos sin fallar. Has desbloqueado el código secreto: LIBERTAD2024"
        );
      } else {
        narrate(
          "¡Felicidades! Has escapado del sistema. El conocimiento es la clave para escribir software de calidad."
        );
      }

      // Efecto de escritura para el terminal de victoria
      const typingElements = document.querySelectorAll(
        ".victory-screen .typing-effect"
      );
      typingElements.forEach((element) => {
        const text = element.innerHTML;
        element.innerHTML = "";

        let i = 0;
        const speed = 20;

        function typeWriter() {
          if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
          }
        }

        typeWriter();
      });
    }
  }

  // Verificar respuesta del desafío 1 (consola interactiva)
  const executeButton = document.getElementById("execute-button");
  const consoleInput = document.getElementById("console-input");

  if (executeButton) {
    executeButton.addEventListener("click", () => {
      const answer = consoleInput.value.trim();
      const consoleOutput = document.getElementById("console-output");

      // Añadir comando a la consola
      consoleOutput.innerHTML += `<div>> ${answer}</div>`;

      // Reproducir sonido de tecleo
      playSound(typingSound);

      // Verificar respuesta
      if (answer === "3") {
        consoleOutput.innerHTML += `<div class="success">> Complejidad ciclomática correcta. Acceso permitido.</div>`;
        showFeedback(
          1,
          true,
          "¡Correcto! Has calculado la complejidad ciclomática correctamente."
        );
        setTimeout(advanceToNextLevel, 2000);
      } else {
        consoleOutput.innerHTML += `<div class="error">> Error: Complejidad ciclomática incorrecta. Acceso denegado.</div>`;
        showFeedback(
          1,
          false,
          "Incorrecto. Revisa tu cálculo de la complejidad ciclomática."
        );

        // Si hay demasiados intentos fallidos, mostrar pantalla de derrota
        if (failedAttempts >= 3) {
          setTimeout(showDefeatScreen, 2000);
        }
      }

      // Limpiar input
      consoleInput.value = "";
    });

    // Permitir presionar Enter para ejecutar
    consoleInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        executeButton.click();
      }
    });
  }

  // Verificar respuesta del desafío 2 (opción múltiple)
  const checkButton2 = document.getElementById("check-2");
  if (checkButton2) {
    checkButton2.addEventListener("click", () => {
      const selectedOption = document.querySelector(
        'input[name="answer-2"]:checked'
      );

      if (selectedOption && selectedOption.value === "1") {
        showFeedback(
          2,
          true,
          "¡Correcto! La clase Usuario tiene alto acoplamiento porque depende directamente de Notificador."
        );
        setTimeout(advanceToNextLevel, 2000);
      } else {
        showFeedback(
          2,
          false,
          "Incorrecto. Analiza nuevamente el acoplamiento entre las clases."
        );

        // Si hay demasiados intentos fallidos, mostrar pantalla de derrota
        if (failedAttempts >= 3) {
          setTimeout(showDefeatScreen, 2000);
        }
      }
    });
  }

  // Verificar respuesta del desafío 3 (opción múltiple)
  const checkButton3 = document.getElementById("check-3");
  if (checkButton3) {
    checkButton3.addEventListener("click", () => {
      const selectedOption = document.querySelector(
        'input[name="answer-3"]:checked'
      );

      if (selectedOption && selectedOption.value === "2") {
        showFeedback(
          3,
          true,
          "¡Correcto! La clase tiene baja cohesión porque realiza demasiadas tareas diferentes."
        );
        setTimeout(advanceToNextLevel, 2000);
      } else {
        showFeedback(
          3,
          false,
          "Incorrecto. Analiza nuevamente la cohesión de la clase Procesador."
        );

        // Si hay demasiados intentos fallidos, mostrar pantalla de derrota
        if (failedAttempts >= 3) {
          setTimeout(showDefeatScreen, 2000);
        }
      }
    });
  }

  // Verificar código secreto
  const verifyCodeButton = document.getElementById("verify-code");
  if (verifyCodeButton) {
    verifyCodeButton.addEventListener("click", () => {
      const codeInput = document.getElementById("secret-code").value.trim();

      if (codeInput === secretCode) {
        // Mostrar final secreto
        document.getElementById("victory-screen").style.display = "none";
        document.getElementById("secret-screen").style.display = "block";
        playSound(victorySound);
        narrate(
          "Código maestro desbloqueado. Has obtenido acceso privilegiado al sistema."
        );

        // Efecto de escritura para el terminal secreto
        const typingElements = document.querySelectorAll(
          ".secret-screen .typing-effect"
        );
        typingElements.forEach((element) => {
          const text = element.innerHTML;
          element.innerHTML = "";

          let i = 0;
          const speed = 20;

          function typeWriter() {
            if (i < text.length) {
              element.innerHTML += text.charAt(i);
              i++;
              setTimeout(typeWriter, speed);
            }
          }

          typeWriter();
        });
      } else {
        alert("Código incorrecto. Intenta de nuevo.");
      }
    });
  }

  // Botón de reinicio
  const restartButton = document.getElementById("restart-button");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Botón de reinicio desde final secreto
  const restartFromSecretButton = document.getElementById(
    "restart-from-secret"
  );
  if (restartFromSecretButton) {
    restartFromSecretButton.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Función para mostrar/ocultar pistas
  window.toggleHint = (level) => {
    const hintContent = document.querySelector(`#hint-${level} .hint-content`);
    if (hintContent.style.display === "block") {
      hintContent.style.display = "none";
    } else {
      hintContent.style.display = "block";
    }
  };

  // Función para generar glitches aleatorios (modo difícil)
  function randomGlitch() {
    if (difficulty !== "hard") return;

    const overlay = document.getElementById("screen-overlay");
    overlay.className = "screen-overlay error";
    playSound(glitchSound);

    // Añadir texto glitch aleatorio a la consola si estamos en el primer desafío
    if (currentLevel === 1) {
      const consoleOutput = document.getElementById("console-output");
      const glitchMessages = [
        "<div class='error'>> ERROR: Memoria corrupta</div>",
        "<div class='error'>> ADVERTENCIA: Sistema inestable</div>",
        "<div class='error'>> Intento de acceso no autorizado detectado</div>",
        "<div class='error'>> Fallo en el sistema de seguridad</div>",
      ];

      const randomMessage =
        glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
      consoleOutput.innerHTML += randomMessage;

      // Mantener el scroll al final
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    setTimeout(() => {
      overlay.className = "screen-overlay";
    }, 300);
  }

  // Función para simular escritura en la consola
  function typeConsoleText() {
    const consoleOutput = document.getElementById("console-output");
    const lines = [
      "> Analizando código...",
      "> Calculando complejidad ciclomática...",
      "> Ingresa el resultado:",
    ];

    consoleOutput.innerHTML = "";

    let lineIndex = 0;
    let charIndex = 0;

    function typeLine() {
      if (lineIndex < lines.length) {
        if (charIndex < lines[lineIndex].length) {
          consoleOutput.innerHTML =
            consoleOutput.innerHTML.slice(0, -4) +
            lines[lineIndex].charAt(charIndex) +
            "<span class='cursor'>_</span>";
          charIndex++;
          setTimeout(typeLine, 30);
        } else {
          consoleOutput.innerHTML =
            consoleOutput.innerHTML.slice(0, -4) +
            "<br><span class='cursor'>_</span>";
          lineIndex++;
          charIndex = 0;
          setTimeout(typeLine, 500);
        }
      } else {
        consoleOutput.innerHTML =
          consoleOutput.innerHTML.slice(0, -23) + lines.join("<br>");
      }
    }

    consoleOutput.innerHTML = "<span class='cursor'>_</span>";
    setTimeout(typeLine, 500);
  }

  // Función para narración con voz
  function narrate(text) {
    if ("speechSynthesis" in window) {
      const mensaje = new SpeechSynthesisUtterance(text);
      mensaje.lang = "es-ES";
      mensaje.rate = 0.9;
      mensaje.pitch = 0.8;

      // Intentar encontrar una voz robótica o masculina
      const voices = speechSynthesis.getVoices();
      for (let i = 0; i < voices.length; i++) {
        if (voices[i].lang.includes("es")) {
          mensaje.voice = voices[i];
          break;
        }
      }

      speechSynthesis.speak(mensaje);
    }
  }

  // Añadir interactividad a las opciones
  const options = document.querySelectorAll(".option");
  options.forEach((option) => {
    option.addEventListener("click", function () {
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });

  // Asegurar que los enlaces se abran en nuevas pestañas
  const resourceLinks = document.querySelectorAll(".resource-link");
  resourceLinks.forEach((link) => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Añadir funcionalidad para hacer los QR más grandes al hacer clic
  const qrImages = document.querySelectorAll(".qr-code img");
  qrImages.forEach((img) => {
    img.addEventListener("click", function () {
      // Crear un modal para mostrar el QR más grande
      const modal = document.createElement("div");
      modal.className = "qr-modal";

      const modalContent = document.createElement("div");
      modalContent.className = "qr-modal-content";

      const largeQR = document.createElement("img");
      largeQR.src = this.src;
      largeQR.alt = this.alt;

      const closeBtn = document.createElement("span");
      closeBtn.className = "qr-modal-close";
      closeBtn.innerHTML = "&times;";
      closeBtn.onclick = () => {
        document.body.removeChild(modal);
      };

      modalContent.appendChild(closeBtn);
      modalContent.appendChild(largeQR);
      modal.appendChild(modalContent);

      document.body.appendChild(modal);

      // Cerrar el modal al hacer clic fuera de la imagen
      modal.onclick = (event) => {
        if (event.target === modal) {
          document.body.removeChild(modal);
        }
      };
    });
  });
});

// Añadir estilos para el modal de QR
const style = document.createElement("style");
style.textContent = `
.qr-modal {
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    align-items: center;
    justify-content: center;
}

.qr-modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.qr-modal-content img {
    max-width: 100%;
    max-height: 80vh;
}

.qr-modal-close {
    position: absolute;
    top: 10px;
    right: 15px;
    color: #333;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

/* Estilo para pantalla de game over */
.game-over {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    text-align: center;
    color: #ff5252;
    padding: 2rem;
}

.game-over h1 {
    font-size: 3rem;
    margin-bottom: 2rem;
}

.game-over p {
    font-size: 1.5rem;
    margin-bottom: 3rem;
    max-width: 600px;
}
`;
document.head.appendChild(style);
