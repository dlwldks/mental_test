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
  stats.push({ gender, age });
  localStorage.setItem("stats", JSON.stringify(stats));
}

function showStats() {
  document.getElementById('result').classList.add('hidden');
  document.getElementById('stats').classList.remove('hidden');

  const stats = JSON.parse(localStorage.getItem("stats") || "[]");

  const genderCounts = { male: 0, female: 0, other: 0 };
  const ageGroups = { "10대": 0, "20대": 0, "30대": 0, "40대 이상": 0 };

  stats.forEach(({ gender, age }) => {
    genderCounts[gender]++;
    if (age < 20) ageGroups["10대"]++;
    else if (age < 30) ageGroups["20대"]++;
    else if (age < 40) ageGroups["30대"]++;
    else ageGroups["40대 이상"]++;
  });

  new Chart(document.getElementById('genderChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(genderCounts),
      datasets: [{ label: '성별 비율', data: Object.values(genderCounts), backgroundColor: 'skyblue' }]
    }
  });

  new Chart(document.getElementById('ageChart'), {
    type: 'bar',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [{ label: '나이대 비율', data: Object.values(ageGroups), backgroundColor: 'salmon' }]
    }
  });
}
