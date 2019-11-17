/* global context, beforeEach, cy, it */

context('Demo', () => {
  context('Visit the homepage', () => {
    beforeEach(() => {
      cy.visit('/')
    })

    it('display copyright', () => {
      cy.get('body').contains('Copyright © COPYRIGHT_OWNER')
    })
  })
})
