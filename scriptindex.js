function loadProgrammingLanguages() {
    fetch('Server/catalogprograms.json')
    .then(response => response.json())
    .then(data => {
        const subheader = document.querySelector('.subheader');
        const programs = data.Programs;
        let counter = 0;

        for (const key in programs) {
            if (counter >= 9) {
                document.querySelector('.arrow.right').disabled = false;
                break;
            }
            const program = programs[key];
            const languageCell = document.createElement('td');
            languageCell.className = 'language';
            languageCell.innerHTML = `
			<div>
                <img src="${program.icon}" alt="${program.name}" width="64" height="64">
                <span>${program.name}</span>
			</div>
            `;
            subheader.querySelector('tr').appendChild(languageCell);
            counter++;
        }
        const RightDivArrow = document.createElement('td');
        RightDivArrow.className = 'arrow-cell';
        RightDivArrow.innerHTML = '<button disabled class="arrow right">&rarr;</button>';
        subheader.querySelector('tr').appendChild(RightDivArrow);
        size = 195;
        applyHoverEffect(size);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProgrammingLanguages();
    size = 195;
    applyHoverEffect(size);

    const leftArrow = document.querySelector('.arrow.left');

    leftArrow.addEventListener('click', () => {
        // Логика возвращения на предыдущую страницу
    });

    const observer = new MutationObserver(mutations => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                const rightArrow = document.querySelector('.arrow.right');
                if (rightArrow) {
                    rightArrow.addEventListener('click', () => {
                        // Логика перехода на следующую страницу
                    });
                    observer.disconnect();
                }
            }
        }
    });

    const config = { childList: true, subtree: true };
    const targetNode = document.querySelector('.subheader');
    observer.observe(targetNode, config);
});

function applyHoverEffect(size) {
    const selectedOverlay = document.querySelector('.selected') || document.createElement('div');
    if (!selectedOverlay.classList.contains('selected')) {
        selectedOverlay.classList.add('selected');
		document.querySelector('.subheader').appendChild(selectedOverlay);
    }
	
    document.querySelectorAll('td').forEach(td => {
        td.addEventListener('mouseenter', function() {
            let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
            Array.from(this.children).forEach(child => {
                const rect = child.getBoundingClientRect();
                minX = Math.min(minX, rect.left);
                minY = Math.min(minY, rect.top);
                maxX = Math.max(maxX, rect.right);
                maxY = Math.max(maxY, rect.bottom);
            });

            selectedOverlay.style.width = `${maxX - minX + 5}px`;
            selectedOverlay.style.height = `${maxY - minY + 5}px`;
            selectedOverlay.style.top = `${minY + window.scrollY - 5 - size}px`;
            selectedOverlay.style.left = `${minX + window.scrollX - 5}px`;
            selectedOverlay.style.position = 'absolute';
            selectedOverlay.style.border = '2px solid #3498db';
            selectedOverlay.style.boxShadow = '0 0 5px #3498db';
            selectedOverlay.style.backgroundColor = '#3498db';
            selectedOverlay.style.pointerEvents = 'none';
            selectedOverlay.style.display = 'block';
            selectedOverlay.style.zIndex = '-1';
			selectedOverlay.style.borderRadius = `5px`;

            td.style.cursor = 'pointer';
            document.querySelectorAll(`table tr td:nth-child(${columnIndex + 1})`).forEach(td => {
                td.style.pointerEvents = 'none';
            });
        });

        td.addEventListener('mouseleave', function() {
            selectedOverlay.style.display = 'none';
            td.style.cursor = 'default';
            document.querySelectorAll(`table tr td:nth-child(${columnIndex + 1})`).forEach(td => {
                td.style.pointerEvents = 'auto';
            });
        });
    });
}

function updateLanguageElements() {
    const languageElements = document.querySelectorAll('.language');

    if (window.innerWidth >= 1600) {
        languageElements.forEach((element, index) => {
        if (index > 7) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 170;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 1300) {
        languageElements.forEach((element, index) => {
        if (index > 6) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 165;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 1100) {
        languageElements.forEach((element, index) => {
        if (index > 5) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 155;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 900) {
        languageElements.forEach((element, index) => {
        if (index > 4) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 135;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 750) {
        languageElements.forEach((element, index) => {
        if (index > 3) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 135;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 500) {
        languageElements.forEach((element, index) => {
        if (index > 2) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 115;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 300) {
        languageElements.forEach((element, index) => {
        if (index > 1) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 105;
            applyHoverEffect(size);
        }
        });
    } else if (window.innerWidth >= 150) {
        languageElements.forEach((element, index) => {
        if (index !== 0) {
            element.style.display = 'none';
        } else {
            element.style.display = '';
            size = 95;
            applyHoverEffect(size);
        }
        });
    } else {
        languageElements.forEach(element => {
            element.style.display = '';
        });
    }
}
  
document.addEventListener('DOMContentLoaded', function() {
    window.onload = updateLanguageElements;
});

window.addEventListener('resize', updateLanguageElements);  