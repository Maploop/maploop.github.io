const projectsData = {
    "projects": [
        
    ]
};

// Icon SVGs
const icons = {
    external: '<svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    npm: '<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    video: '<svg viewBox="0 0 24 24"><polygon points="23 12 8 22 8 2 23 12"/></svg>',
    docker: '<svg viewBox="0 0 24 24"><path d="M13.5 11h-2v2h2v-2zm0-3h-2v2h2V8zm3 0h-2v2h2V8zm0 3h-2v2h2v-2zm0 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm0-3h-2v2h2v-2z"/></svg>'
};

function createTechStack(technologies) {
    return technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
}

function createLinks(links) {
    const linkElements = [];
    
    Object.keys(links).forEach(linkType => {
        if (icons[linkType] && links[linkType]) {
            linkElements.push(`
                <a href="${links[linkType]}" class="link-icon" target="_blank" rel="noopener noreferrer">
                    ${icons[linkType]}
                </a>
            `);
        }
    });
    
    return linkElements.join('');
}

function loadProjects() {
    const tbody = document.getElementById('portfolio-body');
    
    try {
        setTimeout(() => {
            const projects = projectsData.projects;
            
            if (!projects || projects.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="no-data">No projects found.</td></tr>';
                return;
            }

            projects.sort((a, b) => {
                if (b.year !== a.year) {
                    return b.year - a.year;
                }
                return a.title.localeCompare(b.title);
            });

            tbody.innerHTML = projects.map(project => `
                <tr>
                    <td class="year">${project.year}</td>
                    <td class="title">${project.title}</td>
                    <td class="company">${project.company || '—'}</td>
                    <td class="tech-stack">${createTechStack(project.technologies)}</td>
                    <td class="links">${createLinks(project.links)}</td>
                </tr>
            `).join('');
        }, 500); 
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">Error loading projects. Please try again later.</td></tr>';
        console.error('Error loading projects:', error);
    }
}

async function loadProjectsFromFile(jsonFilePath = './projects.json') {
    const tbody = document.getElementById('portfolio-body');
    
    try {
        const response = await fetch(jsonFilePath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const projects = data.projects;
        
        if (!projects || projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No projects found.</td></tr>';
            return;
        }

        projects.sort((a, b) => {
            if (b.year !== a.year) {
                return b.year - a.year;
            }
            return a.title.localeCompare(b.title);
        });

        tbody.innerHTML = projects.map(project => `
            <tr>
                <td class="year">${project.year}</td>
                <td class="title">${project.title}</td>
                <td class="company">${project.company || '—'}</td>
                <td class="tech-stack">${createTechStack(project.technologies)}</td>
                <td class="links">${createLinks(project.links)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="error">Error loading projects. Please try again later.</td></tr>';
        console.error('Error loading projects:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => loadProjectsFromFile('projects_data.json'));