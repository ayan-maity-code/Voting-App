const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Candidate = require("../models/candidate");
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const { findById } = require("../models/user");

//check for admin
const checkForAdmin = async (userID) => {
  try {
    const user = await User.findById(userID);

    if (user.role === "admin") {
      return true;
    }
  } catch (error) {
    return false;
  }
};

// post route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkForAdmin(req.user.id))) {
      return res.status(403).json({ error: "Unauthorized: User is not admin" });
    }
    const data = req.body; // assuming that body parser store the data at req.body
    const newCandidate = new Candidate(data);

    // save user data to the database

    const response = await newCandidate.save();
    console.log("Candidate Data Saved");

    res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: " Internal Server Error" });
  }
});

// update candidate data

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkForAdmin(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized: User is not admin" });
    }
    const candidateID = req.params.candidateID; // extract the id(id assigned by mongodb) from URL parameter
    const updatedCandidateData = req.body; // Update candidate data

    const response = await User.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      {
        new: true, // return updated document
        runValidators: true, // run mongoose validation
      }
    );

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate Data Updated");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: " Internal Server Error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkForAdmin(req.user.id)) {
      return res.status(403).json({ error: "Unauthorized: User is not admin" });
    }
    const candidateID = req.params.candidateID; // extract the id(id assigned by mongodb) from URL parameter

    const response = await User.findByIdAndDelete(candidateID);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate Deleted");
    res.status(200).json(response);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: " Internal Server Error" });
  }
});

// lets start voting

router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  // no admin can vote
  // user can vote only once

  const candidateID = req.params.candidateID;
  const userID = req.user.id;
  try {
    // find candidate with the specific candidateid
    const candidate = await Candidate.findById(candidateID);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // if voted already thennot allowed
    if (user.isVoted) {
      return res.status(400).json({ error: "User already voted" });
    }

    // if admin then not allowed
    if (user.role === "admin") {
      return res.status(403).json({ error: "Admin cannot vote" });
    }

    //update the candidate record to count the vote
    candidate.votes.push({ user: userID });
    candidate.voteCount++;
    await candidate.save();

    //update user document
    user.isVoted = true;
    await user.save();
    res.status(200).json({ message: "Vote Casted Successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal Server Error" });
  }
});

// count vote
router.get("/vote/count", async (req, res) => {
  try {
    // find  all candidate and sort then in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    // Map the candidate to only return their name and vote count
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get the list of candidates
router.get("/candidates", async (req, res) => {
  try {
    // const candidate = await Candidate.find({}, 'name party -_id');

    const candidate = await Candidate.find();

    const candidateName = candidate.map((data) => {
      return {
        name: data.name,
        party: data.party,
      };
    });
    res.status(200).json(candidateName);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
