<script setup lang="ts">
import {
  Callout,
  BulletList,
  BulletItem,
  Divider,
  Text,
  Empty,
  Heading,
  LinkMention,
  Link,
} from "@lauravivan/notion-portfolio";
</script>

<template>
  <Text
    >My name is Laura, I&apos;m a systems analyst focused on web development,
    with a strong foundation in Front-End.</Text
  >

  <Text
    >I graduate from Instituto Federal de Santa Catarina (IFSC). I also made one
    year of Computer Science at Universidade Regional de Blumenau (FURB), where
    I discovered a taste for logic, programming and databases.</Text
  >

  <Text>
    I&apos;ve worked in a varied health-focused systems, in
    <Link :href="'https://estudosarquivados.pt/'">Estudos Arquivados</Link> and
    <Link :href="'https://acessiweb.vercel.app/'">AcessiWeb</Link>.
  </Text>

  <Text>
    Throughout my journey, I&apos;ve worked on projects with a strong focus on
    accessibility and social impact. I developed AcessiWeb, a web system
    designed to make WCAG accessibility guidelines easier to understand while
    implementing some of these practices directly into the application to
    improve the experience for users with different accessibility needs.
  </Text>

  <Text>
    Later, I joined
    <Link href="'https://lacreisaude.com.br/'">Lacrei Saúde</Link>, a
    social-impact health tech that connects the LGBTQIAPN+ community with
    inclusive and qualified healthcare professionals, where I grew as a
    developer and eventually took on the role of Front-End Tech Lead.
  </Text>

  <Text
    >I&apos;m building
    <Link href="'https://notionportfolio.arualvivan.com/'"
      >Notion portfolio</Link
    >, <Link href="'https://yoko.arualvivan.com/'">Yoko!</Link>,
    <Link href="'https://haru.arualvivan.com/'">Haru</Link>,
    <Link href="'https://nori.arualvivan.com/'">Nori</Link> and
    <Link href="'https://koda.arualvivan.com/'">Koda</Link>
    <LinkMention  :href="'/projects'" emoji="🎯">Go to my projects</LinkMention>
  </Text>

  <Empty />

  <Callout>What my goals are?</Callout>
  <BulletList
    ><BulletItem
      >Software Engineering Graduate/Postgraduate Certificate</BulletItem
    ><BulletItem>Full-Stack development mid-level</BulletItem></BulletList
  >

  <Empty />

  <Divider />

  <Heading :level="3">Resume/CV</Heading>

  <Empty />

  <LinkMention href="/cv-LauraVivan.pdf" emoji="👋"
    >Access my resume in Portuguese</LinkMention
  >

  <LinkMention href="/cv-en-LauraVivan.pdf" emoji="👋"
    >Access my resume in English</LinkMention
  >
</template>
