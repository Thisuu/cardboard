document.addEventListener("DOMContentLoaded", function() {

    // Create flags container
    const flagsContainer = document.createElement('div');
    flagsContainer.className = 'flags-container';

    // Create and add title
    const title = document.createElement('h3');
    title.textContent = 'Now available in:';
    Object.assign(title.style, {
        textShadow: '-1px -1px 2px rgba(230, 110, 15, 0.8), 1px 1px 2px rgba(255, 180, 100, 0.9)'
    });
    flagsContainer.appendChild(title);

    // Create regions text with flags
    const regionsText = document.createElement('p');
    regionsText.className = 'regions-text';
    Object.assign(regionsText.style, {
        color: '#d7d7d7',
        textShadow: '-1px -1px 2px rgba(230, 110, 15, 0.8), 1px 1px 2px rgba(255, 180, 100, 0.9)'
    });

    // Define countries and flag URLs
    const flagsData = [
        { url: 'https://portfolio.metamask.io/assets/usa-logo-CrYemUl8.png', name: 'United States* ' },
        { url: 'https://i.imgur.com/6508qqL.png', name: 'United Kingdom' },
        { url: 'https://portfolio.metamask.io/assets/eu-logo-D2kcT_4h.png', name: 'European Union' },
        { url: 'https://portfolio.metamask.io/assets/switzerland-logo-DzxK4DrV.png', name: 'Switzerland' },
        { url: 'https://portfolio.metamask.io/assets/brazil-logo-CrxrNgrC.png', name: 'Brazil' },
        { url: 'https://portfolio.metamask.io/assets/mexico-logo-DIZQa0xa.png', name: 'Mexico' },
        { url: 'https://i.imgur.com/XkgX5Xv.png', name: 'Colombia' },
        { url: 'https://i.imgur.com/0BOGSKM.png', name: 'Argentina' }
    ];

    // Add region names
    const regionNames = flagsData.map(country => country.name).join('  | ');
    regionsText.textContent = regionNames;
    flagsContainer.appendChild(regionsText);

    // Create flags and add them to the container
    flagsData.forEach(country => {
        const flag = document.createElement('img');
        flag.src = country.url;
        flag.alt = country.name;
        flag.className = 'flag';
        flagsContainer.appendChild(flag);
    });

    // Create and add the note
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = '*excludes New York and Vermont';
    Object.assign(note.style, {
        fontSize: '0.8em',
        marginTop: '5px',
        textShadow: '-1px -1px 2px rgba(230, 110, 15, 0.8), 1px 1px 2px rgba(255, 180, 100, 0.9)'
    });
    flagsContainer.appendChild(note);

    // Style the container
    Object.assign(flagsContainer.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0)',
        color: 'white',
        padding: '15px',
        zIndex: '1000',
        maxWidth: '350px',
        display: 'block',
        fontFamily: '"Euclid Circular B", sans-serif'
    });

    // Style the flags
    flagsContainer.querySelectorAll('.flag').forEach(flag => {
        Object.assign(flag.style, {
            width: '30px',
            height: '30px',
            margin: '5px',
            borderRadius: '50px',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)'
        });
    });

    // Append to body
    document.body.appendChild(flagsContainer);
});

