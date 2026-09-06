import { connectDb, disconnectDb } from "../src/config/db.js";
import User from "../src/models/User.model.js";
import Post from "../src/models/Post.model.js";
import Like from "../src/models/Like.model.js";
import Comment from "../src/models/Comment.model.js";

const createUser = async (name, residency = "Chhattisgarh") => {
  const username = name.toLowerCase().split(" ").join("-");

  return await User.create({
    name,
    email: `${username}@seed.example.com`,
    username,
    password: "SeedPassword123",
    residency,
  });
};

const createPost = async (
  user,
  category,
  likeCount,
  commentCount,
  viewCount,
  createdAt,
  caption,
) => {
  return await Post.create({
    title: caption.slice(0, 100),
    media: "https://example.com/seed-post.jpg",
    caption,
    category,
    likeCount,
    commentCount,
    viewCount,
    author: user._id,
    createdAt,
    updatedAt: createdAt,
  });
};

const getWeekDate = (weeksAgo, postNumber) => {
  const date = new Date();
  date.setDate(date.getDate() - weeksAgo * 7 - 1);
  date.setHours(12, postNumber, 0, 0);

  return date;
};

const createConsistencyPosts = async (user, postsPerWeek, caption) => {
  for (let weeksAgo = 0; weeksAgo < postsPerWeek.length; weeksAgo += 1) {
    for (let postNumber = 0; postNumber < postsPerWeek[weeksAgo]; postNumber += 1) {
      await createPost(
        user,
        "Fitness",
        20,
        5,
        50,
        getWeekDate(weeksAgo, postNumber),
        `${caption} - week ${weeksAgo + 1} post ${postNumber + 1}`,
      );
    }
  }
};

const seed = async () => {
  await connectDb();

  try {
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});

    const now = new Date();

    // Multi-category leader: Technology (900) is stronger than Education (700).
    const multiCategoryLeader = await createUser("Mira Multi Category Leader");
    await createPost(
      multiCategoryLeader,
      "Technology",
      600,
      80,
      300,
      now,
      "MULTI CATEGORY LEADER - strongest Technology post",
    );
    await createPost(
      multiCategoryLeader,
      "Education",
      400,
      60,
      600,
      new Date(now.getTime() - 60000),
      "MULTI CATEGORY LEADER - lower Education post",
    );

    const educationSpecialist = await createUser("Esha Education Specialist");
    await createPost(
      educationSpecialist,
      "Education",
      400,
      50,
      450,
      now,
      "Education replacement after multi-category conflict",
    );

    // Tie score: both score 100, but the first post wins because it has more comments.
    const tieMoreComments = await createUser("Tara Tie More Comments");
    await createPost(
      tieMoreComments,
      "Food",
      70,
      10,
      0,
      now,
      "TIE CASE - score 100 with 10 comments",
    );
    const tieFewerComments = await createUser("Tej Tie Fewer Comments");
    await createPost(
      tieFewerComments,
      "Food",
      94,
      2,
      0,
      new Date(now.getTime() - 60000),
      "TIE CASE - score 100 with 2 comments",
    );

    // Ineligible user: score is very high but Maharashtra residency makes this user ineligible.
    const ineligibleUser = await createUser("Outside State Star", "Maharashtra");
    await createPost(
      ineligibleUser,
      "Entertainment",
      1500,
      100,
      1000,
      now,
      "INELIGIBLE USER - would lead Global without residency filtering",
    );

    // Exhausted category: Lifestyle has only this one eligible participant.
    const lifestyleOnlyUser = await createUser("Lina Lifestyle Only");
    await createPost(
      lifestyleOnlyUser,
      "Lifestyle",
      20,
      5,
      100,
      now,
      "EXHAUSTED CATEGORY - only eligible Lifestyle post",
    );

    // KYC cascade: four low-ranked Travel users leave replacements after first and second place.
    const travelUsers = [
      "Chetan Travel First",
      "Charu Travel Second",
      "Chirag Travel Cascade One",
      "Chitra Travel Cascade Two",
    ];

    for (let index = 0; index < travelUsers.length; index += 1) {
      const travelUser = await createUser(travelUsers[index]);
      await createPost(
        travelUser,
        "Travel",
        70 - index * 5,
        5,
        0,
        new Date(now.getTime() - index * 60000),
        `KYC CASCADE - Travel candidate ${index + 1}`,
      );
    }

    // These users fill Global/Top Performer ahead of Travel candidates.
    for (let index = 1; index <= 15; index += 1) {
      const topPerformer = await createUser(`Top Performer Seed ${index}`);
      await createPost(
        topPerformer,
        "Business",
        500 - index * 10,
        20,
        100,
        new Date(now.getTime() - index * 60000),
        `Top Performer seed candidate ${index}`,
      );
    }

    const consistencyWinner = await createUser("Connie Consistency Winner");
    await createConsistencyPosts(
      consistencyWinner,
      [3, 3, 3, 3],
      "CONSISTENCY WINNER",
    );

    const consistencyRunner = await createUser("Rohan Consistency Runner");
    await createConsistencyPosts(
      consistencyRunner,
      [3, 3, 3, 3],
      "CONSISTENCY RUNNER",
    );

    // Near miss: weeks 1-3 have three posts, but week 4 has only two.
    const nearMissConsistency = await createUser("Nina Near Miss Consistency");
    await createConsistencyPosts(
      nearMissConsistency,
      [3, 3, 3, 2],
      "NEAR MISS CONSISTENCY - week 4 intentionally has only two posts",
    );

    console.log("Seed data created successfully.");
    console.log("Mira Multi Category Leader: Technology 900, Education 700.");
    console.log("Tara and Tej tie at score 100; Tara wins on comment count.");
    console.log("Nina Near Miss Consistency has only two week-4 posts.");
    console.log("Outside State Star is ineligible because residency is Maharashtra.");
    console.log("Lifestyle has one eligible participant, so second place is unawarded.");
    console.log("Travel has four cascade candidates for the admin KYC demo.");
  } finally {
    await disconnectDb();
  }
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
