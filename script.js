let currentPage = 0;
let answers = [];
let gender = "";
let age = 0;
let job = "";

let agePieChart, genderChart, levelChart, jobPieChart, comparisonChart, summaryChart;

function startTest() {
  gender = document.getElementById('gender').value;
  age = parseInt(document.getElementById('age').value);
  job = document.getElementById('job').value.trim();

  if (!age || age < 1) {
    alert("나이를 입력해주세요!");
    return;
  }
  if (!job) {
    alert("직업을 입력해주세요!");
    return;
  }

  document.getElementById('intro').classList.add('hidden');
  document.getElementById('test').classList.remove('hidden');

  showQuestions();
}

function showQuestions() {
  const form = document.getElementById('question-form');
  form.innerHTML = "";

  const start = currentPage * 5;
  const end = Math.min(start + 5, questions.length);

  for (let i = start; i < end; i++) {
    const q = document.createElement('div');
    q.innerHTML = `
      <p>${questions[i]}</p>
      <label><input type="radio" name="q${i}" value="5" required> 매우 그렇다</label>
      <label><input type="radio" name="q${i}" value="4"> 그렇다</label>
      <label><input type="radio" name="q${i}" value="3"> 중간이다</label>
      <label><input type="radio" name="q${i}" value="2"> 그렇지 않다</label>
      <label><input type="radio" name="q${i}" value="1"> 매우 그렇지 않다</label>
    `;
    form.appendChild(q);
  }

  document.getElementById('progress').style.width = `${(end / questions.length) * 100}%`;
}

function nextPage() {
  const form = document.getElementById('question-form');
  const radios = form.querySelectorAll('input[type="radio"]:checked');

  if (radios.length < (currentPage + 1) * 5 - currentPage * 5) {
    alert("모든 문항에 응답해주세요.");
    return;
  }

  const startIdx = currentPage * 5;
  for (let i = 0; i < radios.length; i++) {
    const questionIndex = startIdx + i;
    let value = parseInt(radios[i].value);
    if (reverseIndexes.includes(questionIndex)) {
      value = 6 - value;
    }
    answers[questionIndex] = value;
  }

  currentPage++;
  if (currentPage * 5 >= questions.length) {
    showResult();
  } else {
    showQuestions();
  }
}

function drawSummaryChart(resultScores) {
  const container = document.getElementById('result');
  const canvas = document.createElement('canvas');
  canvas.id = 'summaryChart';
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  summaryChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['정서적 안정', '공감/사회성', '자기 통제', '자기 인식'],
      datasets: [{
        label: '점수 (%)',
        data: resultScores.map(x => Math.round((x / 5) * 100)),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          max: 100,
          ticks: {
            callback: val => `${val}%`
          }
        }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: '항목별 정신 건강 백분율'
        }
      }
    }
  });
}

function showResult() {
  document.getElementById('test').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');

  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  const resultTitle = document.getElementById('result-title');
  
  if (avg >= 4.5) {
    resultTitle.textContent = "당신은 제정신입니다.";
  } else if (avg >= 3.0) {
    resultTitle.textContent = "위험 수준입니다.";
  } else {
    resultTitle.textContent = "당신은 제정신이 아닙니다.";
  }

  const categories = [
    answers.slice(0,10),
    answers.slice(10,20),
    answers.slice(20,30),
    answers.slice(30,40)
  ];
  const scores = categories.map(arr => arr.reduce((a,b) => a + b, 0)/arr.length);

  drawSummaryChart(scores);
  saveToStorage(scores);
}

function saveToStorage(scores) {
  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  let level = "";
  if (avg >= 4.5) level = "정상";
  else if (avg >= 3.0) level = "위험";
  else level = "비정상";

  stats.push({ gender, age, job, level, scores });
  localStorage.setItem("stats", JSON.stringify(stats));
}

// 나머지 함수(showStats, drawAgePie, showDetailedStats 등)는 기존 코드와 동일하게 유지

function showStats() {
  document.getElementById('result').classList.add('hidden');
  document.getElementById('stats').classList.remove('hidden');

  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  if (stats.length === 0) return;

  const currentUser = stats[stats.length - 1];

  // 현재 사용자 정보
  document.getElementById('current-user-info').innerHTML = `
    <div class="user-box">
      <h3>나의 정보</h3>
      <p>성별: ${currentUser.gender === 'male' ? '남성' : currentUser.gender === 'female' ? '여성' : '기타'}</p>
      <p>나이: ${currentUser.age}세</p>
      <p>직업: ${currentUser.job}</p>
      <p>수준: <span class="level-${currentUser.level}">${currentUser.level}</span></p>
    </div>
  `;

  // 연령대별 분포 원형 그래프
  const ageGroups = { "10대":0, "20대":0, "30대":0, "40대":0, "50대 이상":0 };
  stats.forEach(s => {
    if (s.age < 20) ageGroups["10대"]++;
    else if (s.age < 30) ageGroups["20대"]++;
    else if (s.age < 40) ageGroups["30대"]++;
    else if (s.age < 50) ageGroups["40대"]++;
    else ageGroups["50대 이상"]++;
  });
  if (agePieChart) agePieChart.destroy();
  agePieChart = new Chart(document.getElementById('agePie'), {
    type: 'pie',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [{
        data: Object.values(ageGroups),
        backgroundColor: ['#26c6da','#ef5350','#ffb300','#7e57c2','#8bc34a']
      }]
    },
    options: { plugins: { title: { display: true, text: '연령별 분포' } } }
  });

  // 직업별 분포 원형 그래프
  const jobCounts = {};
  stats.forEach(s => {
    jobCounts[s.job] = (jobCounts[s.job] || 0) + 1;
  });
  if (jobPieChart) jobPieChart.destroy();
  jobPieChart = new Chart(document.getElementById('jobPie'), {
    type: 'pie',
    data: {
      labels: Object.keys(jobCounts),
      datasets: [{
        data: Object.values(jobCounts),
        backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0']
      }]
    },
    options: { plugins: { title: { display: true, text: '직업 분포' } } }
  });

  // 성별, 수준 비율
  drawAgePie('all');
}

function drawAgePie(ageGroup) {
  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  let filtered = stats;
  let label = "전체";

  if (ageGroup === "10") { filtered = stats.filter(s => s.age < 20); label="10대"; }
  else if (ageGroup === "20") { filtered = stats.filter(s => s.age >= 20 && s.age < 30); label="20대"; }
  else if (ageGroup === "30") { filtered = stats.filter(s => s.age >= 30 && s.age < 40); label="30대"; }
  else if (ageGroup === "40") { filtered = stats.filter(s => s.age >= 40 && s.age < 50); label="40대"; }
  else if (ageGroup === "50") { filtered = stats.filter(s => s.age >= 50); label="50대 이상"; }

  const genderCounts = { male:0, female:0, other:0 };
  const levelCounts = { "정상":0, "위험":0, "비정상":0 };

  filtered.forEach(({gender, level}) => {
    genderCounts[gender]++;
    levelCounts[level]++;
  });

  if (genderChart) genderChart.destroy();
  genderChart = new Chart(document.getElementById('genderChart'), {
    type: 'pie',
    data: {
      labels: ['남성','여성','기타'],
      datasets: [{
        data: [genderCounts.male, genderCounts.female, genderCounts.other],
        backgroundColor: ['#26c6da','#ef5350','#ffb300']
      }]
    },
    options: { plugins: { title: { display: true, text: label+' 성별 비율' } } }
  });

  if (levelChart) levelChart.destroy();
  levelChart = new Chart(document.getElementById('levelChart'), {
    type: 'pie',
    data: {
      labels: ['정상','위험','비정상'],
      datasets: [{
        data: [levelCounts['정상'], levelCounts['위험'], levelCounts['비정상']],
        backgroundColor: ['#26c6da','#ffb300','#ef5350']
      }]
    },
    options: { plugins: { title: { display: true, text: label+' 정신수준 비율' } } }
  });

  // 버튼 활성화
  document.querySelectorAll('.age-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.age-btn[onclick*="'${ageGroup}'"]`).classList.add('active');

  // 사용자 강조 표시
  document.querySelectorAll('.user-bar').forEach(el => el.remove());

  const statsAll = JSON.parse(localStorage.getItem("stats") || "[]");
  const currentUser = statsAll[statsAll.length - 1];

  
}

function showDetailedStats() {
  document.getElementById('stats').classList.add('hidden');
  document.getElementById('comparison').classList.remove('hidden');
  showComparison();
}

function showComparison() {
  const ctx = document.getElementById('comparisonChart').getContext('2d');
  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  if (stats.length === 0) return;
  const currentUser = stats[stats.length - 1];

  const data = getComparisonData(currentUser);

  if (comparisonChart) comparisonChart.destroy();

  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: {
        x: { stacked: false },
        y: { max: 5, ticks: { stepSize:1 } }
      },
      plugins: {
        title: {
          display: true,
          text: '항목별 비교 분석'
        }
      }
    }
  });
}

function getComparisonData(user) {
  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  const ageGroup = Math.floor(user.age/10)*10;
  const agePeers = stats.filter(s => Math.floor(s.age/10)*10 === ageGroup && s.job !== user.job);
  const jobPeers = stats.filter(s => s.job === user.job && s.age !== user.age);
  return {
    labels: ['정서적 안정', '사회적 유대', '자기 통제', '자기 인식'],
    datasets: [
      {
        label: '내 점수',
        data: user.scores,
        backgroundColor: 'rgba(255, 99, 132, 0.8)'
      },
      {
        label: `${ageGroup}대 평균`,
        data: calculateAverage(agePeers),
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      },
      {
        label: `${user.job} 평균`,
        data: calculateAverage(jobPeers),
        backgroundColor: 'rgba(75, 192, 192, 0.8)'
      }
    ]
  };
}

function calculateAverage(data) {
  const sums = [0,0,0,0];
  data.forEach(d => {
    d.scores.forEach((s,i) => sums[i] += s);
  });
  return sums.map(s => s / data.length || 0);
}