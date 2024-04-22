import express from "express";
import auth, {RequestWithUser} from "../middleware/auth";
import {TaskMutation} from "../types";
import Task from "../models/Task";

const tasksRouter = express.Router();

tasksRouter.post('/', auth, async (req, res, next) => {
    const user = (req as RequestWithUser).user;

    const taskData: TaskMutation = {
        user: user._id,
        title: req.body.title,
        description: req.body.description,
    }

    const task = new Task(taskData);
    try {
        await task.save();
        return res.send(task);
    } catch (error) {
        next(error);
    }
});

tasksRouter.get('/', auth, async (req, res, next) => {
    const user = (req as RequestWithUser).user;

    try {
        const tasks = await Task.find({ user: user._id });

        res.send(tasks);
    } catch (error) {
        next(error);
    }
});

tasksRouter.put('/:id', auth, async (req, res) => {
    const taskId = req.params.id;
    const user = (req as RequestWithUser).user;

    try {
        const task = await Task.findById(taskId).populate('user');
        if (!task) {
            return res.status(404).send({ error: 'Task not found'});
        }

        if (!task.user || task.user._id.toString() !== user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to update' });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.status = req.body.status || task.status;

        await task.save();
        res.send(task);
    } catch (error) {
        res.status(500).send({error: 'Failed to update task'});
    }
});

tasksRouter.delete('/:id', auth, async (req, res) => {
    const taskId = req.params.id;
    const user = (req as RequestWithUser).user;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ error: 'Task not found' });
        }

        if (task.user.toString() !== user._id.toString()) {
            return res.status(403).send({ error: 'Not authorized to delete this task' });
        }

        await Task.findByIdAndDelete(taskId);
        res.send({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete the task' });
    }
});


export default tasksRouter;