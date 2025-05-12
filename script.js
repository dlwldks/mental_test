let currentPage = 0;
let answers = [];
let gender = "";
let age = 0;

function startTest() {
  gender = document.getElementById('gender').value;
  age = parseInt(document.getElementById('age').value);

  if (!age || age < 1) {
    alert("나이를 입력해주세요!");
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
  const end = start + 5;

  for (let i = start; i < end && i < questions.length; i++) {
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

  if (radios.length < 5) {
    alert("모든 문항에 응답해주세요.");
    return;
  }

  radios.forEach(r => answers.push(parseInt(r.value)));

  currentPage++;
  if (currentPage * 5 >= questions.length) {
    showResult();
  } else {
    showQuestions();
  }
}

function showResult() {
  document.getElementById('test').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');

  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  const resultTitle = document.getElementById('result-title');
  const light = document.getElementById('traffic-light');

  if (avg >= 4.5) {
    resultTitle.textContent = "당신은 제정신입니다.";
    light.classList.add('green');
  } else if (avg >= 3.0) {
    resultTitle.textContent = "위험 수준입니다.";
    light.classList.add('orange');
  } else {
    resultTitle.textContent = "당신은 제정신이 아닙니다.";
    light.classList.add('red');
  }

  // 저장: 통계용
  saveToStorage();
}

function saveToStorage() {
  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  let level = "";
  if (avg >= 4.5) level = "정상";
  else if (avg >= 3.0) level = "위험";
  else level = "비정상";
  stats.push({ gender, age, level }); // level 추가
  localStorage.setItem("stats", JSON.stringify(stats));
}

let agePieChart, genderPieChart, levelPieChart;

function showStats() {
  document.getElementById('result').classList.add('hidden');
  document.getElementById('stats').classList.remove('hidden');

  const stats = JSON.parse(localStorage.getItem("stats") || "[]");
  const currentUser = stats[stats.length - 1];

  // 현재 사용자 정보 표시
  document.getElementById('current-user-info').innerHTML = `
    <div class="user-box">
      <h3>나의 정보</h3>
      <p>성별: ${currentUser.gender === 'male' ? '남성' : (currentUser.gender === 'female' ? '여성' : '기타')}</p>
      <p>나이: ${currentUser.age}세</p>
      <p>수준: <span class="level-${currentUser.level}">${currentUser.level}</span></p>
    </div>
  `;

  // 연령대 분포 원형 그래프
  const ageGroups = { "10대": 0, "20대": 0, "30대": 0, "40대": 0, "50대 이상": 0 };
  stats.forEach(({ age }) => {
    if (age < 20) ageGroups["10대"]++;
    else if (age < 30) ageGroups["20대"]++;
    else if (age < 40) ageGroups["30대"]++;
    else if (age < 50) ageGroups["40대"]++;
    else ageGroups["50대 이상"]++;
  });
  if (agePieChart) agePieChart.destroy();
  agePieChart = new Chart(document.getElementById('agePie'), {
    type: 'pie',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [{
        data: Object.values(ageGroups),
        backgroundColor: ['#26c6da', '#ef5350', '#ffb300', '#7e57c2', '#8bc34a']
      }]
    },
    options: { plugins: { title: { display: true, text: '연령별 분포' } } }
  });

  // 기본 전체 통계 표시
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

  // 성별 비율
  const genderCounts = { male: 0, female: 0, other: 0 };
  // 정신수준 비율
  const levelCounts = { "정상": 0, "위험": 0, "비정상": 0 };

  filtered.forEach(({ gender, level }) => {
    genderCounts[gender]++;
    levelCounts[level]++;
  });

  // 성별 원형 그래프
  if (genderPieChart) genderPieChart.destroy();
  genderPieChart = new Chart(document.getElementById('genderChart'), {
    type: 'pie',
    data: {
      labels: ['남성', '여성', '기타'],
      datasets: [{
        data: [genderCounts.male, genderCounts.female, genderCounts.other],
        backgroundColor: ['#26c6da', '#ef5350', '#ffb300']
      }]
    },
    options: { plugins: { title: { display: true, text: label+' 성별 비율' } } }
  });

  // 정신수준 원형 그래프
  if (levelPieChart) levelPieChart.destroy();
  levelPieChart = new Chart(document.getElementById('levelChart'), {
    type: 'pie',
    data: {
      labels: ['정상', '위험', '비정상'],
      datasets: [{
        data: [levelCounts['정상'], levelCounts['위험'], levelCounts['비정상']],
        backgroundColor: ['#26c6da', '#ffb300', '#ef5350']
      }]
    },
    options: { plugins: { title: { display: true, text: label+' 정신수준 비율' } } }
  });

  // 버튼 스타일 활성화
  document.querySelectorAll('.age-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.age-btn[onclick*="'${ageGroup}'"]`).classList.add('active');

  // 기존 강조 네모 제거
  document.querySelectorAll('.user-bar').forEach(el => el.remove());

  // 현재 설문자 강조 (성별, 정신수준)
  const statsAll = JSON.parse(localStorage.getItem("stats") || "[]");
  const currentUser = statsAll[statsAll.length - 1];
  // 성별
  const genderLabels = { male: "남성", female: "여성", other: "기타" };
  const genderIndex = Object.keys(genderLabels).indexOf(currentUser.gender);
  if (genderIndex >= 0 && filtered.some(s => s.gender === currentUser.gender)) {
    document.getElementById('genderChart').parentNode.insertAdjacentHTML('beforeend',
      `<div class="user-bar" style="top:10px;left:${40 + genderIndex*80}px">
        <strong>내 성별: ${genderLabels[currentUser.gender]}</strong>
      </div>`
    );
  }
  // 정신수준
  const levelIndex = ["정상", "위험", "비정상"].indexOf(currentUser.level);
  if (levelIndex >= 0 && filtered.some(s => s.level === currentUser.level)) {
    document.getElementById('levelChart').parentNode.insertAdjacentHTML('beforeend',
      `<div class="user-bar" style="top:10px;left:${40 + levelIndex*80}px">
        <strong>내 수준: ${currentUser.level}</strong>
      </div>`
    );
  }
}
