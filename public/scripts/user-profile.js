const url = 'https://hackateam-cat.herokuapp.com'

// code from jsperf.com
function getCookieValue(a) {
  b = '; ' + document.cookie;
  c = b.split('; ' + a + '=');
  return !!(c.length - 1) ? c.pop().split(';').shift() : '';
}

// get userId out of cookie
const userId = JSON.parse(atob(getCookieValue('session'))).passport.user

let allPossibleSkills = []

function getFormData() {
  let formData = {}

  formData.first_name = document.getElementById('inputFirstName').value
  formData.last_name = document.getElementById('inputLastName').value
  formData.portfolio_url = document.getElementById('inputURL').value

  return formData
}

function submitHandler(ev) {
  ev.preventDefault()

  axios.put(`${url}/users/${userId}`, getFormData())
    .then(() => { window.location.href = `https://hackateam-cat.herokuapp.com/html/dashboard.html` })
    .catch((err) => { console.log(err) })
}

function createChip(skillAdded) {
  // skillAdded is an object with attributes type and id

  let chipDiv = document.createElement('div')
  chipDiv.classList.add('chip')
  chipDiv.innerText = skillAdded.type
  chipDiv.setAttribute('id', skillAdded.type)
  let closeSpan = document.createElement('span')
  closeSpan.classList.add('closebtn')
  closeSpan.innerHTML = '&times;'
  chipDiv.appendChild(closeSpan)
  chipsDiv.appendChild(chipDiv)

  // add event listener to delete
  closeSpan.addEventListener('click', (event) => {
    let type = document.getElementById(skillAdded.type)
    type.parentNode.removeChild(type)

    axios.delete(`${url}/skills/${skillAdded.id}`, { data: { user_id: userId } })
      .catch(err => { console.log(err) })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const addButton = document.getElementById('add-button')
  const chipsDiv = document.getElementById('chipsDiv')

  // get existing user info from database and fill in form
  axios.get(`${url}/users/${userId}`)
    .then(response => {
      let user = response.data

      // populate form with current user data
      document.getElementById('userPicture').setAttribute('src', user.user_picture_url)
      document.getElementById('inputFirstName').value = user.first_name
      document.getElementById('inputLastName').value = user.last_name
      document.getElementById('inputURL').value = user.portfolio_url
      document.getElementById('inputEmail').value = user.email
    })
    .catch((err) => { console.log(err) })

  // get all current skills for user and make chips for them
  axios.get(`${url}/users/${userId}/skills`)
    .then(response => {
      response.data.forEach(skill => { createChip(skill) })
    })

  // get list of all possible skills and append to datalist
  axios.get(`${url}/skills`)
    .then(response => {
      allPossibleSkills = response.data.map(skillObj => skillObj.type)
      let skillsDatalist = document.getElementById('skills')
      allPossibleSkills.forEach(skill => {
        let option = document.createElement('option')
        option.setAttribute('value', skill)
        skillsDatalist.appendChild(option)
      })
    })

  addButton.addEventListener('click', () => {
    let skillInput = document.querySelector(`[list='skills']`)
    // don't add blank skills
    if (skillInput.value) {
      let skillAdded = { type: skillInput.value }

      if (allPossibleSkills.includes(skillAdded.type)) {
        axios.post(`${url}/skills`, { type: skillAdded.type, user_id: userId })
          .then(response => {
            skillAdded.id = response.data.skillsData.id
            createChip(skillAdded)
          })
          .catch((err) => { console.log(err) })
      }
      else {
        allPossibleSkills.push(skillAdded.type)

        axios.post(`${url}/skills/new`, { type: skillAdded.type, user_id: userId })
          .then(response => {
            skillAdded.id = response.data.skillsData.id
            createChip(skillAdded)
          })
          .catch((err) => { console.log(err) })
      }

      skillInput.value = ''
    }
  })

  // on submit, get info out of form and update user in database
  document.getElementById('editProfileForm').addEventListener('submit', submitHandler)
})
