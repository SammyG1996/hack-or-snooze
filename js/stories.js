"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}


//The checkFavs() function recived the ID of the story that is
//to be appeneded and checks to see if its in the logged in 
//users favorites list. 
 function checkFavs(id) {
   if(currentUser === undefined){
     return false
   } else {
     for (let i = 0; i < currentUser.favorites.length; i++) {
       if (currentUser.favorites[i].storyId === id) {
         return true
       }
      }
    }
      
}

//this will add the stars that are favorites when you log in
function addStars() { 
  const stars = document.querySelectorAll('.fa-star')
  for (let star of stars){
    // console.log(star.parentElement.id)
    if (checkFavs(star.parentElement.id) === true) {
     star.className = "fa-solid fa-star"
    } 
  }
}
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

//I updated this function to return two different things 
//based on whether the story is a favorite or not. This is
//decided by passing the story's ID to the checkFavs() function. 
function generateStoryMarkup(story) {

  if (checkFavs(story.storyId) === true) {

  return $(`
      <li id="${story.storyId}">
      <i class="fa-solid fa-star"></i>
      <i class="fa fa-trash"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${story.url})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user ${story.username}">posted by ${story.username}</small>
      </li>
    `);
  } else {
    return $(`
    <li id="${story.storyId}">
    <i class="fa-regular fa-star"></i>
    <i class="fa fa-trash"></i>
      <a href="${story.url}" target="a_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${story.url})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user ${story.username}">posted by ${story.username}</small>
    </li>
  `);
  }
}

//This will add the story to the favorites array using axios.post
async function addFav(id) {
  await axios.post(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${id}`, {'token': `${currentUser.loginToken}`})
}

//This will delete the story to the favorites array using axios.delete
async function removeFav(id) {
  await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${id}`, {data: {'token': `${currentUser.loginToken}`}})
}

//Based on if the star is already checked or not it will either remove or add it to favorites
$allStoriesList.on('click', '.fa-star', (event) => {
  if(event.target.className === 'fa-regular fa-star'){
    addFav(event.target.parentElement.id);
    event.target.className = 'fa-solid fa-star'
  } else{
    removeFav(event.target.parentElement.id);
    event.target.className = 'fa-regular fa-star'
  }
})



/* This function will be called to see if the your username linked to the post.
 If it is NOT the trash can icon will be hidden*/

function addDeleteBtn() {
  const trashIcons = document.querySelectorAll('.fa-trash')
  for(let trash of trashIcons ){
    if(!trash.parentElement.lastElementChild.classList.contains(`${currentUser.username}`)){
      trash.style.display = 'none'
    }
  }
} 

//This function when called will make a delete request to the API. 
async function removeStory(id) {
  await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${id}`, {data: {'token': `${currentUser.loginToken}`}})
}

//When the trash icon is clicked it will delete the story from the API and remove it from the DOM.
$allStoriesList.on('click','.fa-trash', (event) => {
  removeStory(event.target.parentElement.id)
  event.target.parentElement.remove()
})




/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
  
    $allStoriesList.append($story);
    
  }

  $allStoriesList.show();
}




//When you click post this will add new stories to the server. 
//It will call the addStory() function and then 
//pass it on to the addStoriesToPage() function -SG
$('#post').on('click', async (event) => {
  event.preventDefault();
  StoryList.addStoriesToPage(await StoryList.addStory())
  $('#add-new-story').hide()
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
});
