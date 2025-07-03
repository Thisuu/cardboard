export function createMainLogo() {
  // Create a container for the retro text
  const retroTextContainer = document.createElement('div');
  retroTextContainer.classList.add('retro-text-container');

  // Create the retro text element
  const retroText = document.createElement('div');
  retroText.textContent = 'CARDBOARD';
  retroText.classList.add('retro-text');
  retroTextContainer.appendChild(retroText);

  // Create the flying card element
  const cardElement = document.createElement('div');
  cardElement.classList.add('flying-card');
  
  // Add the "🦊 METAMASK" text to the card
  const cardText = document.createElement('div');
  cardText.textContent = '🦊 METAMASK';
  cardText.classList.add('card-text');
  cardElement.appendChild(cardText);

  // Append card to the retroTextContainer
  retroTextContainer.appendChild(cardElement);

  // Append retroTextContainer to the body
  document.body.appendChild(retroTextContainer);

  // Add the styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

    .retro-text-container {
      position: absolute;
      top: 1.2rem; /* Use rem for scalable spacing */
      left: 1.2rem; /* Use rem for scalable spacing */
      display: inline-block;
      max-width: 100%; /* Ensure it doesn't overflow on smaller screens */
    }

    .retro-text {
      font-size: 5rem; /* Using rem for responsive font size */
      color: #da6746;
      font-family: 'Bebas Neue', sans-serif;
      text-transform: uppercase;
      -webkit-text-stroke: 0.0505rem #fff; /* rem for stroke width */
      text-shadow:
        -0.1875rem -0.1875rem 0 #eedcce,
        0.1875rem 0.1875rem 0 #c24753,
        0.375rem 0.375rem 0 #9a3828;
      line-height: 1;
    }

    .flying-card {
      position: absolute;
      top: -2.625rem; /* Adjusted with rem */
      right: 0;
      width: 5rem; /* Use rem for responsive sizing */
      height: 3.125rem; /* Use rem for responsive sizing */
      background: linear-gradient(135deg, #1384C5, #83af9b);
      border-radius: 0.5rem; /* Rounded corners in rem */
      box-shadow: 0px 0.25rem 0.5rem rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
    }
    
    .card-text {
      font-family: 'Euclid Circular B', sans-serif;
      font-size: 0.625rem; /* Using rem for responsive font size */
      color: #fff;
      text-shadow: 0.0625rem 0.0625rem 0.125rem rgba(0, 0, 0, 0.5);
      font-weight: 500;
      position: absolute;
      bottom: 0.5rem; /* Use rem for scalable spacing */
      width: 100%;
      text-align: center;
      letter-spacing: 0.03125rem; /* Use rem for letter spacing */
    }

    .retro-text-container:hover .flying-card {
      animation: fly-card 1s ease-in-out;
    }

    @keyframes fly-card {
      0% {
        transform: translateX(100%);
      }
      30% {
        transform: translateX(-50%) rotate(-20deg);
      }
      60% {
        transform: translateX(-250%) rotate(-10deg);
      }
      100% {
        transform: translateX(100%);
      }
    }

    /* Add media queries for further responsiveness */
    @media (max-width: 1200px) {
      .retro-text {
        font-size: 4rem;
      }
      .flying-card {
        top: -2rem;
        width: 4rem;
        height: 2.5rem;
      }
      .card-text {
        font-size: 0.5rem;
        bottom: 0.375rem;
      }
    }

    @media (max-width: 768px) {
      .retro-text-container {
        top: 1rem;
        left: 1rem;
      }
      .retro-text {
        font-size: 3rem;
      }
      .flying-card {
        top: -1.5rem;
        width: 3rem;
        height: 1.875rem;
      }
      .card-text {
        font-size: 0.4rem;
        bottom: 0.25rem;
      }
    }
  `;

  // Append the styles to the document
  document.head.appendChild(style);
}
