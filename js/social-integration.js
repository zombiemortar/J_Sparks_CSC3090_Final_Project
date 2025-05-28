// GitHub Activity Feed
async function fetchGitHubActivity() {
    const username = 'zombiemortar';
    const activityContainer = document.getElementById('github-activity');
    
    // Add loading indicator
    activityContainer.innerHTML = '<div class="loading">Updating GitHub activity...</div>';
    
    try {
        const response = await fetch(`https://api.github.com/users/${username}/events/public`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        // Check for rate limit headers
        const rateLimit = {
            limit: response.headers.get('X-RateLimit-Limit'),
            remaining: response.headers.get('X-RateLimit-Remaining'),
            reset: new Date(response.headers.get('X-RateLimit-Reset') * 1000)
        };
        
        // Log rate limit info and store it
        console.log('GitHub API Rate Limit:', {
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            resetTime: rateLimit.reset.toLocaleTimeString()
        });

        // Store the rate limit info
        localStorage.setItem('githubRateLimit', JSON.stringify({
            remaining: rateLimit.remaining,
            reset: rateLimit.reset.getTime()
        }));
        
        if (!response.ok) {
            if (response.status === 403 && rateLimit.remaining === '0') {
                const resetTime = rateLimit.reset.toLocaleTimeString();
                throw new Error(`Rate limit exceeded. Resets at ${resetTime}`);
            }
            throw new Error(`GitHub API responded with status ${response.status}`);
        }
        
        const data = await response.json();
        activityContainer.innerHTML = ''; // Clear loading indicator
        
        // Display the 5 most recent activities
        const recentActivities = data.slice(0, 5);
        
        if (recentActivities.length === 0) {
            activityContainer.innerHTML = '<p>No recent GitHub activity found.</p>';
            return;
        }
        
        recentActivities.forEach(activity => {
            const date = new Date(activity.created_at).toLocaleDateString();
            let activityText = '';
            
            switch(activity.type) {
                case 'PushEvent':
                    const commits = activity.payload.commits || [];
                    activityText = `Pushed ${commits.length} commit(s) to ${activity.repo.name}`;
                    break;
                case 'CreateEvent':
                    activityText = `Created ${activity.payload.ref_type} ${activity.payload.ref || ''} in ${activity.repo.name}`;
                    break;
                case 'PullRequestEvent':
                    activityText = `${activity.payload.action} pull request in ${activity.repo.name}`;
                    break;
                case 'IssuesEvent':
                    activityText = `${activity.payload.action} issue in ${activity.repo.name}`;
                    break;
                default:
                    activityText = `Activity in ${activity.repo.name}`;
            }
            
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';
            activityElement.innerHTML = `
                <p>${activityText}</p>
                <span class="date">${date}</span>
            `;
            activityContainer.appendChild(activityElement);
        });
    } catch (error) {
        console.error('Error fetching GitHub activity:', error);
        activityContainer.innerHTML = 
            `<p>Unable to load GitHub activity. ${error.message}</p>`;
    }
}

// Make social share functions globally accessible
window.shareOnTwitter = function(title, url) {
    const text = encodeURIComponent(title);
    const shareUrl = encodeURIComponent(url || window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
};

window.shareOnLinkedIn = function(url) {
    const shareUrl = encodeURIComponent(url || window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
};

window.shareOnFacebook = function(url) {
    const shareUrl = encodeURIComponent(url || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
};

// Initialize social features when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Fetch GitHub activity if the feed container exists
    const githubFeed = document.getElementById('github-activity');
    if (githubFeed) {
        // Check rate limit before fetching
        const storedLimit = JSON.parse(localStorage.getItem('githubRateLimit') || '{}');
        const now = new Date().getTime();
        
        if (!storedLimit.reset || now >= storedLimit.reset || storedLimit.remaining > 0) {
            fetchGitHubActivity();
            // Refresh GitHub activity every 5 minutes if we have remaining calls
            const refreshInterval = setInterval(() => {
                const currentLimit = JSON.parse(localStorage.getItem('githubRateLimit') || '{}');
                if (!currentLimit.reset || now >= currentLimit.reset || currentLimit.remaining > 0) {
                    fetchGitHubActivity();
                }
            }, 300000); // 5 minutes
        } else {
            const resetTime = new Date(storedLimit.reset).toLocaleTimeString();
            githubFeed.innerHTML = `<p>Rate limit reached. Resets at ${resetTime}</p>`;
        }
    }
    
    // Only add share buttons to project cards on the projects page
    if (window.location.pathname.includes('projects.html')) {
        const projectCards = document.querySelectorAll('.carousel-item .card');
        projectCards.forEach(card => {
            const cardTitle = card.querySelector('.card-title')?.textContent || 'My Portfolio Project';
            const shareButtons = document.createElement('div');
            shareButtons.className = 'share-buttons mt-3';
            shareButtons.innerHTML = `
                <button onclick="window.shareOnTwitter('Check out ${cardTitle}')" class="share-button twitter">
                    <i class="fab fa-twitter"></i> Tweet
                </button>
                <button onclick="window.shareOnLinkedIn()" class="share-button linkedin">
                    <i class="fab fa-linkedin"></i> Share
                </button>
                <button onclick="window.shareOnFacebook()" class="share-button facebook">
                    <i class="fab fa-facebook"></i> Share
                </button>
            `;
            card.querySelector('.card-body')?.appendChild(shareButtons);
        });
    }
}); 