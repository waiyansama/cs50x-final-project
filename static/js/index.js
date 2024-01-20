// DOM
const timerElement = document.getElementById("timer");
const startElement = document.getElementById("start");
const stopElement = document.getElementById("stop");
const pomodoroElement = document.getElementById("pomodoro");
const shortBreakElement = document.getElementById("shortBreak");
const longBreakElement = document.getElementById("longBreak");
const pomodoroCounterElement = document.getElementById("pomodoroCounter");
const shortBreakCounterElement = document.getElementById("shortBreakCounter");
const longBreakCounterElement = document.getElementById("longBreakCounter");
const addElement = document.getElementById("add");
const taskMenuElement = document.getElementById("taskMenu");
const addContainerElement = document.getElementById("addContainer");
const taskListContainerElement = document.getElementById("taskListContainer");
const taskItemElement = document.getElementById("taskItem");
const audioElement = document.getElementById("audio");

let input_minutes;
let timerInterval;
// let isTimerRunning = false;
let pomodoroCounter = 0;
let shortBreakCounter = 0;
let longBreakCounter = 0;
let counter = { isPomodoro: true, isShortBreak: false, isLongBreak: false };

// Fetch data when it's loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
});

/**
 * Initiates a countdown timer that runs every second.
 * Updates the timer display and performs certain actions when the timer reaches zero.
 */
const startTimer = () => {
  if (!timerInterval) {
    let [minutes, seconds] = timerElement.textContent.split(":").map(Number);
    timerInterval = setInterval(() => {
      if (minutes === 0 && seconds === 0) {
        if (counter.isPomodoro) {
          pomodoroCounter++;
          pomodoroCounterElement.textContent = pomodoroCounter;
        } else if (counter.isShortBreak) {
          shortBreakCounter++;
          shortBreakCounterElement.textContent = shortBreakCounter;
        } else if (counter.isLongBreak) {
          longBreakCounter++;
          longBreakCounterElement.textContent = longBreakCounter;
        }
        timerElement.textContent = `${formatNumber(input_minutes)}:00`;
        clearInterval(timerInterval);
        audioElement.play();
        timerInterval = null;
        return;
      } else if (seconds === 0) {
        seconds = 60;
        minutes--;
      } else {
        seconds--;
        timerElement.textContent = `${formatNumber(minutes)}:${formatNumber(
          seconds
        )}`;
      }
    }, 1000);
  }
};

// Format number.Eg. "3" to "03"
const formatNumber = (num) => {
  return num < 10 ? `0${num}` : num;
};

// Stop counting time
const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

const pomodoroHandler = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerElement.textContent = "25:00";
  input_minutes = parseInt(timerElement.textContent.split(":")[0]);
  counter = { isPomodoro: true, isShortBreak: false, isLongBreak: false };
};

const shortBreakHandler = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerElement.textContent = "05:00";
  input_minutes = parseInt(timerElement.textContent.split(":")[0]);
  counter = { isPomodoro: false, isShortBreak: true, isLongBreak: false };
};

const longBreakHandler = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerElement.textContent = "15:00";
  input_minutes = parseInt(timerElement.textContent.split(":")[0]);
  counter = { isPomodoro: false, isShortBreak: false, isLongBreak: true };
};

// Toggle add task
const addHandler = () => {
  addContainerElement.className =
    "bg-light d-flex flex-column pt-1 pt-sm-2 pb-3 pb-sm-4 px-3 rounded-3 mt-3 d-block";
};

const closeHandler = (e) => {
  e.preventDefault();
  addContainerElement.className = "d-none";
};

// Add new task to server
const saveHandler = (e) => {
  e.preventDefault();
  const content = taskItemElement.value.trim();
  if (content !== "") {
    fetch("/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          taskItemElement.value = "";
          fetchTasks();
        } else {
          alert("Failed to add task");
        }
      });
  }
};

// Delete task
const deleteHandler = (event) => {
  // Getting the clicked task id
  let targetId =
    event.target.closest(".btn").parentNode.parentNode.parentNode.id;
  fetch("/delete", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      id: targetId,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchTasks();
      } else {
        alert("Falied to delete");
      }
    });
};

// Toggle Edit task
const editHandler = (event) => {
  // Getting the clicked task's id, text
  let targetId =
    event.target.closest(".btn").parentNode.parentNode.parentNode.id;
  let targetText =
    event.target.closest(".btn").parentNode.parentNode.firstElementChild
      .lastElementChild.innerText;
  let targetHide = event.target.closest(".btn").parentNode.parentNode;
  let targetParent =
    event.target.closest(".btn").parentNode.parentNode.parentNode;

  // Creating edit box
  const editBox = document.createElement("div");
  const editItemElement = document.getElementById("editItem");
  if (!editItemElement) {
    editBox.className =
      "bg-light d-flex flex-column pt-1 pt-sm-2 pb-3 pb-sm-4 px-3 rounded-3 mt-3 d-block";
    editBox.id = "editContainer";
    editBox.innerHTML = ` <form class="container-fluid mt-3">
        <input class="form-control" type="text" id="editItem" />
        <div class="d-flex gap-3">
          <button class="btn btn-primary mt-3" onclick="editSave(event, '${targetId}')">
            Save
          </button>
          <button class="btn btn-light mt-3" onclick="editCancel(event, '${targetId}')">Cancel</button>
        </div>
      </form>`;
    // Add edit box to parent and hide task
    targetParent.appendChild(editBox);
    targetHide.className = "d-none";
    // Set the edit box text to current task
    document.getElementById("editItem").value = targetText;
    // Focus the edit box text
    document.getElementById("editItem").focus();
  }
};

// Save edit
const editSave = (event, targetId) => {
  event.preventDefault();
  editText = document.getElementById("editItem").value.trim();
  if (editText !== "") {
    fetch("/edit", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: targetId,
        text: editText,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          fetchTasks();
        } else {
          alert("Falied to delete");
        }
      });
  }
};

// Cancel Edit
const editCancel = (event, targetId) => {
  event.preventDefault();
  let targetHide = document.getElementById(targetId).firstElementChild;
  // Remove the edit box and unhide the current task
  document.getElementById("editContainer").remove();
  targetHide.className = "d-flex justify-content-between align-items-center";
};

// Check task
const checkHandler = (event) => {
  // Getting the clicked task's id and checked value.
  event.preventDefault();
  targetId = event.target.parentNode.parentNode.parentNode.id;
  targetCheck = event.target.checked;
  // Send data to server
  fetch("/check", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      id: targetId,
      check: targetCheck,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        fetchTasks();
      } else {
        alert("Failed to check");
      }
    });
};

// Fetch the user's data from server and rendering
const fetchTasks = (hide = false) => {
  fetch("/get_data")
    .then((response) => response.json())
    .then((data) => {
      taskListContainerElement.innerHTML = "";
      const totalTaskElement = document.getElementById("totalTask");
      let totalTasks = data.length;
      data.forEach((task) => {
        totalTasks = task.is_check ? totalTasks - 1 : totalTasks;
        let listItem = document.createElement("div");
        listItem.id = task.id;

        // Toggle completed task show and hide
        if (hide) {
          listItem.style.display = task.is_check ? "none" : "";
        }

        listItem.innerHTML = `<div class="d-flex justify-content-between align-items-center mt-sm-2">
        <div class="d-flex align-items-center form-check">
          <input type="checkbox" class="form-check-input"  ${
            task.is_check ? "checked" : ""
          } onchange="checkHandler(event)" />
          <label class="text-white fs-sm-20 form-check-label mx-3 ${
            task.is_check ? "text-decoration-line-through " : ""
          }">
            ${task["text"]}
          </label>
              </div>
              <div class="d-flex">
              <button class="btn btn-dark" onclick="editHandler(event)">
              <div>
                <img src="static/assets/icons/edit.svg" width="24px" class="sm-32"/>
                <span class="d-none">Edit</span>
              </div>
              </button>
              <button class="btn btn-dark" onclick="deleteHandler(event)" >
              <div>
                <img src="static/assets/icons/bin.svg" width="24px" class="sm-32"/>
                <span class="d-none">Delete</span>
              </div>
              </button>
              </div>
              </div>`;
        taskListContainerElement.appendChild(listItem);
      });
      totalTaskElement.innerText = totalTasks;
    })
    .catch((error) => console.error("Error fetching data:", error));
};

const taskSetting = document.getElementById("taskSetting");
// Task show and hide setting
const taskMenu = () => {
  if (taskSetting.className == "d-none") {
    taskSetting.className =
      "bg-light z-3 position-absolute p-2 rounded-2 d-flex flex-column gap-2  end-0 shadow-lg";
  } else {
    taskSetting.className = "d-none";
  }
};

// Toggle show and hide completed task
const showCompletedTask = () => {
  fetchTasks(false);
  taskSetting.className = "d-none";
};

const hideCompletedTask = () => {
  fetchTasks(true);
  taskSetting.className = "d-none";
};

// Event Listeners.
startElement.addEventListener("click", startTimer);
stopElement.addEventListener("click", stopTimer);
pomodoroElement.addEventListener("click", pomodoroHandler);
shortBreakElement.addEventListener("click", shortBreakHandler);
longBreakElement.addEventListener("click", longBreakHandler);
addElement.addEventListener("click", addHandler);
document.getElementById("closeButton").addEventListener("click", closeHandler);
document.getElementById("saveButton").addEventListener("click", saveHandler);
