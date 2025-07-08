/**
 * Message Manager - Handles user messages and notifications
 */
class MessageManager {
  constructor(overlayId = 'messageOverlay') {
    this.overlay = document.getElementById(overlayId);
    this.messageBox = null;
    this.messageText = null;
    this.messageActions = null;
    
    this.createMessageBox();
  }

  createMessageBox() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'messageOverlay';
      this.overlay.className = 'message-overlay';
      document.body.appendChild(this.overlay);
    }

    this.messageBox = document.createElement('div');
    this.messageBox.className = 'message-box';

    this.messageText = document.createElement('p');
    this.messageText.className = 'message-text';

    this.messageActions = document.createElement('div');
    this.messageActions.className = 'message-actions';

    this.messageBox.appendChild(this.messageText);
    this.messageBox.appendChild(this.messageActions);
    this.overlay.appendChild(this.messageBox);

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.hide();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  show(message, actions = null) {
    this.messageText.textContent = message;
    this.messageActions.innerHTML = '';

    if (actions && actions.length > 0) {
      actions.forEach(action => {
        const button = document.createElement('button');
        button.className = `px-4 py-2 rounded-lg font-medium transition-colors ${this.getButtonClass(action.class)}`;
        button.textContent = action.text;
        button.onclick = () => {
          if (action.handler) {
            action.handler();
          }
          this.hide();
        };
        this.messageActions.appendChild(button);
      });
    } else {
      const okButton = document.createElement('button');
      okButton.className = 'px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors';
      okButton.textContent = 'OK';
      okButton.onclick = () => this.hide();
      this.messageActions.appendChild(okButton);
    }

    this.overlay.style.display = 'flex';
    this.messageBox.classList.add('fade-in');
    
    // Focus the first button for accessibility
    const firstButton = this.messageActions.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  }

  hide() {
    this.messageBox.classList.remove('fade-in');
    this.messageBox.classList.add('fade-out');
    
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.messageBox.classList.remove('fade-out');
    }, 300);
  }

  isVisible() {
    return this.overlay.style.display === 'flex';
  }

  showError(message) {
    this.show(message, [{
      text: 'OK',
      class: 'btn-danger'
    }]);
  }

  showSuccess(message) {
    this.show(message, [{
      text: 'OK',
      class: 'btn-success'
    }]);
  }

  showConfirm(message, onConfirm, onCancel = null) {
    this.show(message, [
      {
        text: 'Cancel',
        class: 'btn-secondary',
        handler: onCancel
      },
      {
        text: 'Confirm',
        class: 'btn-primary',
        handler: onConfirm
      }
    ]);
  }

  showLoading(message = 'Loading...') {
    this.messageText.innerHTML = `
      <div class="flex items-center gap-2 justify-center">
        <div class="loading-spinner"></div>
        <span>${message}</span>
      </div>
    `;
    this.messageActions.innerHTML = '';
    this.overlay.style.display = 'flex';
    this.messageBox.classList.add('fade-in');
  }

  getButtonClass(buttonType) {
    switch (buttonType) {
      case 'btn-primary':
        return 'bg-purple-500 hover:bg-purple-600 text-white';
      case 'btn-secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white';
      case 'btn-success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'btn-danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'btn-warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      default:
        return 'bg-purple-500 hover:bg-purple-600 text-white';
    }
  }
}
