import Component from '@ember/component';

class ListContainerComponent extends Component {
  get tagName() { return 'ul'; }

  didInsertElement() {
    this.element.getElementsByTagName('a')[0].focus();
  }
}

export default ListContainerComponent;
