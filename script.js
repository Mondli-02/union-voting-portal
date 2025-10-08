
      // ===== CONFIG =====
      const GAS_URL = "https://script.google.com/macros/s/AKfycbx_L2k7yQAU-zPi_K3esdmtbNKEdMlbI9NZ6xHLhzm88cP48CFiSJfuGSMpjiJBvPWiOw/exec"; // change this
      const deadline = new Date("2025-10-25T23:59:59").getTime();

      const candidateData = {
        "BEN RUSERO": {
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
          slogan: "Leadership you can trust",
          color: "#4361ee"
        },
        "MANDLA NDLOVU": {
          img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
          slogan: "Together for progress",
          color: "#10b981"
        },
        "THEMBA MOYO": {
          img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
          slogan: "A brighter future for all",
          color: "#f97316"
        }
      };

      // ===== UI =====
      const candidateContainer = document.getElementById("candidates");
      const voteBtn = document.getElementById("voteBtn");
      const notification = document.getElementById("notification");
      const notificationText = document.getElementById("notification-text");
      const themeToggle = document.getElementById("themeToggle");

      // Build candidate cards
      for (const [name, data] of Object.entries(candidateData)) {
        candidateContainer.innerHTML += `
          <div class="card card-highlight">
            <img src="${data.img}" alt="${name}" />
            <div class="count" id="count-${name}">0</div>
            <div class="vote-progress">
              <div class="vote-progress-bar" id="progress-${name}" style="width: 0%"></div>
            </div>
            <h3 class="candidate-name">${name}</h3>
            <p class="slogan">${data.slogan}</p>
          </div>`;
      }

      // Notification
      function showNotification(message, type = "info") {
        notificationText.textContent = message;
        notification.className = `notification ${type} show`;
        
        // Change icon based on type
        const icon = notification.querySelector('i');
        if (type === "error") {
          icon.className = "fas fa-exclamation-circle";
        } else if (type === "success") {
          icon.className = "fas fa-check-circle";
        } else {
          icon.className = "fas fa-info-circle";
        }
        
        setTimeout(() => {
          notification.className = "notification";
        }, 3000);
      }

      // ===== COUNTDOWN =====
      function updateCountdown() {
        const now = new Date().getTime();
        const t = deadline - now;
        if (t < 0) {
          document.getElementById("countdown").innerHTML = "<strong>Voting closed!</strong>";
          voteBtn.disabled = true;
          voteBtn.innerHTML = '<i class="fas fa-lock"></i> Voting Ended';
          return;
        }
        const d = Math.floor(t / (1000 * 60 * 60 * 24));
        const h = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((t % (1000 * 60)) / 1000);

        document.getElementById(
          "countdown"
        ).innerHTML = `Time remaining: <br><strong>${d}d ${h}h ${m}m ${s}s</strong>`;
      }
      setInterval(updateCountdown, 1000);
      updateCountdown();

      // ===== RESULTS =====
      let chart;
      async function loadVotes() {
        try {
          const res = await fetch(GAS_URL);
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          const counts = await res.json();

          let totalVotes = 0;
          const labels = [];
          const values = [];
          const colors = [];

          for (const [name, data] of Object.entries(candidateData)) {
            const count = counts[name] || 0;
            totalVotes += count;
            document.getElementById(`count-${name}`).textContent = count;
            
            // Update progress bar
            const progressBar = document.getElementById(`progress-${name}`);
            if (progressBar) {
              setTimeout(() => {
                progressBar.style.width = totalVotes > 0 ? `${(count / totalVotes) * 100}%` : '0%';
              }, 100);
            }
            
            labels.push(name);
            values.push(count);
            colors.push(data.color);
          }

          document.getElementById(
            "total-votes"
          ).textContent = `Total votes: ${totalVotes}`;

          if (!chart) {
            const ctx = document.getElementById('resultsChart').getContext('2d');
            chart = new Chart(ctx, {
              type: "doughnut",
              data: { 
                labels, 
                datasets: [{ 
                  data: values, 
                  backgroundColor: colors,
                  borderWidth: 0,
                  hoverOffset: 15
                }] 
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      font: {
                        size: 13
                      },
                      padding: 20
                    }
                  }
                },
                animation: {
                  animateScale: true,
                  animateRotate: true
                }
              }
            });
          } else {
            chart.data.datasets[0].data = values;
            chart.update();
          }
        } catch (err) {
          console.error(err);
          showNotification("Error loading votes", "error");
        }
      }      
      setInterval(loadVotes, 5000);

      loadVotes();
