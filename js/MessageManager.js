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
      this.overlay.className = 'message-overlay fixed inset-0 bg-black/50 backdrop-blur-sm hidden items-center justify-center z-50 p-4';
      document.body.appendChild(this.overlay);
    }

    this.messageBox = document.createElement('div');
    this.messageBox.className = 'bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto p-8 text-center border border-gray-200';

    this.messageText = document.createElement('p');
    this.messageText.className = 'text-gray-800 text-lg leading-relaxed mb-8';

    this.messageActions = document.createElement('div');
    this.messageActions.className = 'flex gap-3 justify-center flex-wrap';

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
        button.className = `px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${this.getButtonClass(action.class)}`;
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
      okButton.className = 'px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm';
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
      <div class="flex items-center gap-3 justify-center">
        <div class="loading-spinner"></div>
        <span class="text-gray-700 font-medium">${message}</span>
      </div>
    `;
    this.messageActions.innerHTML = '';
    this.overlay.style.display = 'flex';
    this.messageBox.classList.add('fade-in');
  }

  getButtonClass(buttonType) {
    switch (buttonType) {
      case 'btn-primary':
        return 'bg-primary-500 hover:bg-primary-600 text-white border border-primary-500';
      case 'btn-secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white border border-gray-500';
      case 'btn-success':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500';
      case 'btn-danger':
        return 'bg-red-500 hover:bg-red-600 text-white border border-red-500';
      case 'btn-warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-500';
      default:
        return 'bg-primary-500 hover:bg-primary-600 text-white border border-primary-500';
    }
  }
}
