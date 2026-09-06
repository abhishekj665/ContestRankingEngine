import { connectDb, disconnectDb } from "../src/config/db.js";
import User from "../src/models/User.model.js";
import Post from "../src/models/Post.model.js";
import Like from "../src/models/Like.model.js";
import Comment from "../src/models/Comment.model.js";
import { CONTEST_CATEGORIES } from "../src/config/contest.config.js";

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
  if (!CONTEST_CATEGORIES.includes(category)) {
    throw new Error(`Invalid contest category: ${category}`);
  }

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
  if (weeksAgo === 0) {
    const date = new Date();
    date.setMinutes(date.getMinutes() - postNumber);
    return date;
  }

  const date = new Date();
  date.setHours(12, postNumber, 0, 0);
  date.setDate(date.getDate() - date.getDay() - weeksAgo * 7 + 1);

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

    const demoUser = await User.create({
      name: "John Demo",
      username: "john123",
      email: "john@gmail.com",
      password: "John@123",
      residency: "Chhattisgarh",
    });
    await createPost(
      demoUser,
      "Technology",
      12,
      2,
      30,
      now,
      "John demo account post for login verification",
    );

    // Multi-category leader: not a global/top winner, so category allocation
    // must retain Technology (390) and cascade Education (370) to Esha.
    const multiCategoryLeader = await createUser("Mira Multi Category Leader");
    await createPost(
      multiCategoryLeader,
      "Technology",
      300,
      20,
      150,
      now,
      "MULTI CATEGORY LEADER - strongest Technology post",
    );
    await createPost(
      multiCategoryLeader,
      "Education",
      300,
      10,
      200,
      new Date(now.getTime() - 60000),
      "MULTI CATEGORY LEADER - lower Education post",
    );

    const educationSpecialist = await createUser("Esha Education Specialist");
    await createPost(
      educationSpecialist,
      "Education",
      280,
      20,
      100,
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

    // Complete the fixed category set with eligible participants.
    for (const category of ["Sports", "Entertainment", "Fashion"]) {
      for (let position = 1; position <= 2; position += 1) {
        const user = await createUser(`${category} Seed ${position}`);
        await createPost(
          user,
          category,
          100 - position * 10,
          5,
          20,
          new Date(now.getTime() - position * 60000),
          `${category} eligible seed candidate ${position}`,
        );
      }
    }

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

    // Reserve candidates guarantee that each valid category still has enough
    // distinct people after Grand, Consistency, and Top Performer winners are
    // excluded. Lifestyle intentionally remains the sole exhausted category.
    for (const category of CONTEST_CATEGORIES) {
      if (category === "Lifestyle") continue;

      for (let position = 1; position <= 3; position += 1) {
        const user = await createUser(`${category} Reserve ${position}`);
        await createPost(
          user,
          category,
          10 - position,
          1,
          position,
          new Date(now.getTime() - (position + 30) * 60000),
          `${category} reserve candidate ${position}`,
        );
      }
    }

    // Near miss: weeks 1-3 have three posts, but week 4 has only two.
    const nearMissConsistency = await createUser("Nina Near Miss Consistency");
    await createConsistencyPosts(
      nearMissConsistency,
      [3, 3, 3, 2],
      "NEAR MISS CONSISTENCY - week 4 intentionally has only two posts",
    );

    console.log("Seed data created successfully.");
    console.log("Mira leads Technology and Education; Education cascades to Esha.");
    console.log("Tara and Tej tie at score 100; Tara wins on comment count.");
    console.log("Nina Near Miss Consistency has only two week-4 posts.");
    console.log("Outside State Star is ineligible because residency is Maharashtra.");
    console.log("Lifestyle has one eligible participant, so second place is unawarded.");
    console.log("Travel has four cascade candidates for the admin KYC demo.");
    console.log("Every configured category has valid reserve candidates; only Lifestyle is intentionally exhausted.");
  } finally {
    await disconnectDb();
  }
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exitCode = 1;
});
