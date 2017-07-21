import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import RaisedButton from 'material-ui/RaisedButton';
import ActionCheck from 'material-ui/svg-icons/action/check-circle';
import AlertError from 'material-ui/svg-icons/alert/error-outline';
import compose from 'recompose/compose';
import inflection from 'inflection';
import ViewTitle from '../layout/ViewTitle';
import Title from '../layout/Title';
import { ListButton } from '../button';
import { crudGetOne as crudGetOneAction } from '../../actions/dataActions';
import translate from '../../i18n/translate';

const styles = {
    actions: { zIndex: 2, display: 'inline-block', float: 'right' },
    toolbar: { clear: 'both' },
    button: { margin: '10px 24px', position: 'relative' },
};

class Confirm extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    componentDidMount() {
        this.props.crudGetOne(this.props.resource, this.props.id, this.getBasePath());
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== nextProps.id) {
            this.props.crudGetOne(nextProps.resource, nextProps.id, this.getBasePath());
        }
    }

    getBasePath() {
        const { location } = this.props;
        return location.pathname.split('/').slice(0, -2).join('/');
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.action(this.props.resource, this.props.id, this.getBasePath());
    }

    goBack() {
        this.props.history.goBack();
    }

    render() {
        const { defaultTitle, title, id, data, isLoading, resource, translate, areYouSure, submitLabel } = this.props;
        const basePath = this.getBasePath();

        const resourceName = translate(`resources.${resource}.name`, {
            smart_count: 1,
            _: inflection.humanize(inflection.singularize(resource)),
        });
        const renderedDefaultTitle = translate(defaultTitle, {
            name: `${resourceName}`,
            id,
            data,
        });

        const titleElement = data ? <Title defaultTitle={renderedDefaultTitle} title={title} record={data} /> : '';

        return (
            <div>
                <Card style={{ opacity: isLoading ? .8 : 1 }}>
                    <CardActions style={styles.actions}>
                        <ListButton basePath={basePath} />
                    </CardActions>
                    <ViewTitle title={titleElement} />
                    <form onSubmit={this.handleSubmit}>
                        <CardText>{translate(areYouSure)}</CardText>
                        <Toolbar style={styles.toolbar}>
                            <ToolbarGroup>
                                <RaisedButton
                                    type="submit"
                                    label={translate(submitLabel)}
                                    icon={<ActionCheck />}
                                    primary
                                    style={styles.button}
                                />
                                <RaisedButton
                                    label={translate('aor.action.cancel')}
                                    icon={<AlertError />}
                                    onClick={this.goBack}
                                    style={styles.button}
                                />
                            </ToolbarGroup>
                        </Toolbar>
                    </form>
                </Card>
            </div>
        );
    }
}


Confirm.defaultProps = {
  'areYouSure': 'aor.message.are_you_sure',
  'submitLabel': 'aor.action.submit',
  'defaultTitle': 'aor.page.confirm',
}


Confirm.propTypes = {
    defaultTitle: PropTypes.any,
    title: PropTypes.any,
    areYouSure: PropTypes.any,
    submitLabel: PropTypes.any,
    id: PropTypes.string.isRequired,
    resource: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    data: PropTypes.object,
    isLoading: PropTypes.bool.isRequired,
    crudGetOne: PropTypes.func.isRequired,
    action: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
    return {
        id: decodeURIComponent(props.match.params.id),
        data: state.admin[props.resource].data[decodeURIComponent(props.match.params.id)],
        isLoading: state.admin.loading > 0,
    };
}

function createConfirmationComponent(action, props) {
  class ConfirmComponent extends Confirm {};
  ConfirmComponent.defaultProps = { ... Confirm.defaultProps, ... props }

  const connectify = connect(
    mapStateToProps,
    { crudGetOne: crudGetOneAction, action: action }
  )

  return translate(connectify(ConfirmComponent));
}

export default createConfirmationComponent;