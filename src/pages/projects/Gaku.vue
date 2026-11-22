<script setup lang="ts">
import { Text, Heading, BulletItem, BulletList } from "@lauvivans/kami";
</script>

<template>
  <Heading :level="2">About</Heading>
  <Text
    >Gaku is a personal study platform that keeps theory, labs, flashcards,
    quizzes and diagrams in one place. The name comes from 学 (gaku), Japanese
    for study or learning.</Text
  >
  <Text
    >Its character, also called Gaku, is a girl drawn in ink with round glasses
    and a coffee mug. She comments on what is pending and changes mode with the
    study rhythm, and each mode brings a ghost that stands for the feeling
    behind it.</Text
  >

  <Heading :level="2">Reasons</Heading>
  <Text
    >My study material was spread across note apps, repositories and flashcard
    decks. I wanted one place to read a text, highlight what matters, turn it
    into cards and quizzes, draw a diagram and practice in a lab. It starts as a
    tool for one person and costs close to nothing to run.</Text
  >

  <Heading :level="2">My activities</Heading>

  <BulletList>
    <BulletItem
      >Designed the interface and the character in an HTML prototype, with a
      hand-drawn look made with rough.js</BulletItem
    >
    <BulletItem
      >Built the app with React Router in framework mode on Cloudflare Workers,
      with D1 for the database and R2 for files</BulletItem
    >
    <BulletItem
      >Put Cloudflare Access in front of the app, with the Worker checking the
      sign-in token on every request</BulletItem
    >
    <BulletItem
      >Developed studies written in a rich text editor or in Markdown, with
      images, topics and reading progress</BulletItem
    >
    <BulletItem>Developed highlights with colors and notes</BulletItem>
    <BulletItem
      >Developed the account settings: export all data as a ZIP, deactivate and
      delete the account</BulletItem
    >
    <BulletItem>Translated the interface to English and Portuguese</BulletItem>
  </BulletList>

  <Heading :level="4">Where you can access</Heading>

  <Text
    >Gaku is in development and not open to the public yet. The link comes here
    once its landing page is live.</Text
  >
</template>
