#!/usr/bin/env node
const createNpmrc = require('../index')
const [,, repo] = process.argv

createNpmrc(repo)