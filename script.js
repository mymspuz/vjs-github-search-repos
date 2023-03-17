const BASE_URL = 'https://api.github.com/';
const SEARCH_URL = 'search/repositories';
const limit = 10;
// Асинхронная функция запроса к серверу
async function searchForm(event) {
    event.preventDefault();
    // Отменяем отправку данных, если состояние формы не валидно и отображаем ошибки
    if (cancelSending()) return;
    // Показываем лоадер
    reposEmpty('Загрузка....', 'text-success');
    // Делаем запрос
    const response = await fetch(makeUrl(reposSearch.value));
    // Проверяем результат
    if (response.ok) {
        const data = await response.json();
        reposEmpty(`Результат поиска для "${reposSearch.value.trim()}"`, 'text-success');
        viewData(data.items);
    } else {
        reposEmpty('Ошибка запроса сервера', 'text-danger');
    }
    reposSearch.focus();
}
// Отменяем отправку и отображаем ошибки
function cancelSending() {
    if (Object.values(stateForm).some(e => !e)) {
        Object.keys(stateForm).forEach(state => {
            if (!stateForm[state]) {
                const element = reposForm.elements[state];
                changeInput(element, 2);
            }
        })
        return true;
    }
    return false;
}
// Отображаем результат запроса
function viewData(reposList) {
    if (reposList.length) {
        reposList.forEach(repo => {
            const repoData = {
                id: repo.id,
                name: repo.name,
                user: repo.owner.login,
                avatar: repo.owner.avatar_url,
                description: repo.description,
                url: repo.html_url,
                stars: repo.stargazers_count,
                createdAt: formatDate(repo.created_at),
                updatedAt: formatDate(repo.updated_at),
                language: repo.language
            };
            createRepo(repoData);
        })
    } else {
        reposEmpty('Ничего не найдено');
    }
}
// Форматируем дату
function formatDate(date) {
    const partDate = date.split('T');
    return partDate[0].split('-').reverse().join('.');
}
// Отображаем шаблон при отсутствии комментариев
function reposEmpty(msg, className = '') {
    const emptyList = document.createElement('h4');
    emptyList.className = className;
    emptyList.textContent = msg;
    reposList.innerHTML = '';
    reposList.append(emptyList);
}
// Создаем новый элемент репозитория
function createRepo(repo) {
    const reposItem = document.createElement('div');
    reposItem.className = 'repos-item';

    const reposItemTitle = document.createElement('h3');
    reposItemTitle.className = 'repos-item__title';

    const a = document.createElement('a');
    a.href = repo.url;
    a.target = '_blank';
    a.textContent = repo.name;

    reposItemTitle.append(a);

    const reposAuthor = document.createElement('div');
    reposAuthor.className = 'repos-author';

    const img = document.createElement('img');
    img.src = repo.avatar;
    img.alt = repo.user;

    const reposAuthorLogin = document.createElement('h5');
    reposAuthorLogin.className = 'repos-author__login';
    reposAuthorLogin.textContent = repo.user;

    reposAuthor.append(img);
    reposAuthor.append(reposAuthorLogin);

    const reposInfo = document.createElement('div');
    reposInfo.className = 'repos-info';
    const reposInfoCreated = `<p class="repos-info__created"><span class="text-success">CREATED: </span>${repo.createdAt}</p>`;
    const reposInfoUpdated = `<p class="repos-info__updated"><span class="text-danger">UPDATED: </span>${repo.updatedAt}</p>`;
    const reposInfoStars = `<p class="repos-info__stars"><i class="bi bi-star-fill"></i><span>${repo.stars}</span></p>`;
    reposInfo.innerHTML = `${reposInfoCreated}${reposInfoUpdated}${reposInfoStars}`;

    const reposDesc = document.createElement('div');
    reposDesc.className = 'repos-desc';
    reposDesc.innerHTML = `<p>${repo.description}</p>`;

    const reposLanguage = document.createElement('div');
    reposLanguage.className = 'repos-language';
    reposLanguage.innerHTML = `<p><span>language: </span>${repo.language}</p>`;

    reposItem.append(reposItemTitle);
    reposItem.append(reposAuthor);
    reposItem.append(reposInfo);
    reposItem.append(reposDesc);
    reposItem.append(reposLanguage);

    reposList.append(reposItem);
}
// Формируем URL
function makeUrl(value) {
    const url = new URL(SEARCH_URL, BASE_URL);
    url.searchParams.set('q', value);
    url.searchParams.set('per_page', limit.toString());
    return url;
}
// Изменяем внешний вид полей ввода
function changeInput(element, minLength) {
    const value = element.value.trim();

    if (!value) {
        valid(element, 'Не может быть пустым');
    }
    else if (value.length < minLength) {
        valid(element, `Минимальная длина - ${minLength} символа`);
    } else {
        valid(element, '');
    }
}
// Валидируем введенные данные
function valid(element, text) {
    const id = element.id;
    const labelFor = document.querySelector(`label[for=${id}]`);
    const isError = text.length > 0;

    setValid(element, isError);
    setBtnDisabled(id, isError);

    labelFor.textContent = text;
    labelFor.hidden = !isError;
}
// Устанавливаем класс результата валидации
function setValid(element, isError) {
    const classList = Array.from(element.classList);
    if (isError) {
        if (classList.includes(classValid.valid)) element.classList.remove(classValid.valid);
        if (!classList.includes(classValid.invalid)) element.classList.add(classValid.invalid);
    } else {
        if (classList.includes(classValid.invalid)) element.classList.remove(classValid.invalid);
        if (!classList.includes(classValid.valid)) element.classList.add(classValid.valid);
    }
}
// Доступность кнопки отправки данных
function setBtnDisabled(id, isError) {
    stateForm[id] = !isError;
    btnSearch.disabled = Object.values(stateForm).some(e => !e);
}
// Функция очистки формы
function clearForm(event) {
    event.preventDefault();
    resetElement(reposSearch);
    btnSearch.disabled = true;
    reposEmpty('Ничего не найдено');
}
// Функция очистки элемента
function resetElement(element, state = false) {
    element.value = '';
    element.classList.remove(classValid.valid, classValid.invalid);
    document.querySelector(`label[for=${element.id}]`).hidden = true;
    stateForm[element.id] = state;
}

const reposForm = document.forms.reposForm;

const reposSearch = reposForm.elements.reposSearch;
// Получаем кнопки формы
const btnSearch = document.getElementById('btnSearch');
const btnCancel = document.getElementById('btnCancel');

const reposList = document.querySelector('.repos-list');
// Состояние валидности формы
const stateForm = {
    reposSearch: false,
}
// Классы для валидации формы
const classValid = {valid: 'is-valid', invalid: 'is-invalid'};
// Добавляем прослушку событий для формы
reposForm.addEventListener('submit', (event) => searchForm(event));
reposForm.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') searchForm(event);
});
// Добавляем прослушку событий для поля поиска
reposSearch.addEventListener('change', (event) => changeInput(event.target, 2));
reposSearch.addEventListener('input', (event) => changeInput(event.target, 2));
reposSearch.focus();
// Добавляем прослушку событий для кнопки очистки
btnCancel.addEventListener('click', (event) => clearForm(event));
reposEmpty('Ничего не найдено');
