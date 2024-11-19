let taskList = JSON.parse(localStorage.getItem("tasks")) || { todo: [], inProgress: [], done: [] };
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
// Generate unique task IDs
function generateTaskId() {
  const id = nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}

// Todo: create a function to create a task card
// Create a task card dynamically
function createTaskCard(task) {
    const deadlineClass =
      task.status === "done" 
        ? "bg-white text-dark"
        : dayjs(task.deadline).isBefore(dayjs())
        ? "bg-danger text-white" 
        : dayjs(task.deadline).isBefore(dayjs().add(2, "day"))
        ? "bg-warning" 
        : "bg-light"; 
  
    return `
      <div class="card task-card mb-3 ${deadlineClass}" data-id="${task.id}">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p class="card-text"><small>Due: ${dayjs(task.deadline).format("MMM DD, YYYY")}</small></p>
          <button class="btn btn-danger btn-sm delete-task">Delete</button>
        </div>
      </div>
    `;
  }

// Todo: create a function to render the task list and make cards draggable
// Render the task list on the board
function renderTaskList() {
  $(".lane .card-body").empty();

  Object.keys(taskList).forEach((status) => {
    taskList[status].forEach((task) => {
      $(`#${status}-cards`).append(createTaskCard(task));
    });
  });

  // Make task cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    stack: ".task-card",
    cursor: "move",
    containment: ".container",
  });
}

// Todo: create a function to handle adding a new task
// Add a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#task-title").val().trim();
  const description = $("#task-desc").val().trim();
  const deadline = $("#task-due-date").val().trim();

  if (!title || !deadline) {
    alert("Title and Due Date are required!");
    return;
  }

  const newTask = {
    id: generateTaskId(),
    title,
    description,
    deadline,
    status: "todo",
  };

  taskList.todo.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));

  renderTaskList();
  $("#formModal").modal("hide");
  $("#task-form")[0].reset();
}

// Todo: create a function to handle deleting a task
// Delete a task
function handleDeleteTask(event) {
  const card = $(event.target).closest(".task-card");
  const taskId = card.data("id");

  Object.keys(taskList).forEach((status) => {
    taskList[status] = taskList[status].filter((task) => task.id !== taskId);
  });

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
// Handle dropping a task into a new column
function handleDrop(event, ui) {

const taskId = ui.draggable.data("id");
  const newStatus = $(this).attr("id").replace("-cards", "");

  let task;

  // Remove the task from its current status
  Object.keys(taskList).forEach((status) => {
    taskList[status] = taskList[status].filter((t) => {
      if (t.id === taskId) {
        task = t;
        return false;
      }
      return true; 
    });
  });

  // Ensure the new status exists in the taskList object
  if (!taskList[newStatus]) {
    taskList[newStatus] = [];
  }

  // Add the task to the new status
  if (task) {
    task.status = newStatus;
    taskList[newStatus].push(task);
  }

  // Save the updated task list and re-render
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}


// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
// Initialize the page
$(document).ready(function () {
  renderTaskList();

  $(".lane .card-body").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });

  $("#task-due-date").datepicker();
  $("#task-form").on("submit", handleAddTask);
  $(document).on("click", ".delete-task", handleDeleteTask);
});
